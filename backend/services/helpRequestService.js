/**
 * Pure Business Logic Service for Help Requests.
 * Follows H2S Clean Architecture: NO database queries, NO side effects, NO cross-service calls.
 */

const ALLOWED_CATEGORIES = ['Food & Water', 'Medical', 'Rescue', 'Shelter', 'Logistics', 'Other'];
const ALLOWED_URGENCIES = ['low', 'medium', 'high', 'critical'];

const URGENCY_WEIGHTS = {
  low: 10,
  medium: 25,
  high: 50,
  critical: 85,
};

class HelpRequestService {
  normalizeCategory(category) {
    return ALLOWED_CATEGORIES.includes(category) ? category : 'Other';
  }

  normalizeUrgency(urgency) {
    const normalized = typeof urgency === 'string' ? urgency.toLowerCase() : 'medium';
    return ALLOWED_URGENCIES.includes(normalized) ? normalized : 'medium';
  }

  normalizeAffectedCount(affectedCount) {
    const parsed = Number(affectedCount);
    return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
  }

  normalizeLocation(location) {
    if (!location) return null;
    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
    return { latitude, longitude };
  }

  normalizeRequirements(requirements) {
    if (!Array.isArray(requirements)) return [];
    return requirements
      .filter((item) => item && typeof item.itemName === 'string' && item.itemName.trim())
      .map((item) => ({
        ...(item._id ? { _id: item._id } : {}),
        itemName: item.itemName.trim(),
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
        description: (item.description || 'Crisis supply requirement').trim(),
        ...(Array.isArray(item.grantedList) ? { grantedList: item.grantedList } : {}),
      }));
  }

  normalizeRequiredVolunteers(requiredVolunteers) {
    if (!Array.isArray(requiredVolunteers)) return [];
    return requiredVolunteers
      .filter((rv) => rv && typeof rv.role === 'string' && rv.role.trim())
      .map((rv) => ({
        ...(rv._id ? { _id: rv._id } : {}),
        role: rv.role.trim(),
        count: Math.max(1, Math.floor(Number(rv.count) || 1)),
        assignedVolunteers: Array.isArray(rv.assignedVolunteers) ? rv.assignedVolunteers : [],
      }));
  }

  normalizeSkillNames(skills) {
    if (!Array.isArray(skills)) return [];
    const seen = new Set();
    const cleaned = [];
    for (const s of skills) {
      const name = typeof s === 'string' ? s.trim() : typeof s?.name === 'string' ? s.name.trim() : '';
      if (name && !seen.has(name)) {
        seen.add(name);
        cleaned.push(name);
      }
    }
    return cleaned;
  }

  calculateFulfillmentSummary(request) {
    const requirements = request?.requirements || [];
    let totalRequested = 0;
    let totalGranted = 0;
    let totalReceived = 0;

    for (const reqItem of requirements) {
      totalRequested += Number(reqItem.quantity) || 0;
      const grants = Array.isArray(reqItem.grantedList) ? reqItem.grantedList : [];
      for (const grant of grants) {
        if (grant && typeof grant === 'object' && grant.status !== 'cancelled') {
          const qty = Number(grant.quantityApproved) || 0;
          totalGranted += qty;
          if (grant.isReceived) {
            totalReceived += qty;
          }
        }
      }
    }

    const grantedPercent = totalRequested > 0 ? Math.min(100, Math.round((totalGranted / totalRequested) * 100)) : 0;
    const receivedPercent = totalRequested > 0 ? Math.min(100, Math.round((totalReceived / totalRequested) * 100)) : 0;

    return {
      totalRequested,
      totalGranted,
      totalReceived,
      grantedPercent,
      receivedPercent,
      isFullyGranted: totalRequested > 0 && totalGranted >= totalRequested,
      isFullyReceived: totalRequested > 0 && totalReceived >= totalRequested,
    };
  }

  computePriorityScore(request) {
    const urgencyWeight = URGENCY_WEIGHTS[request?.urgency] || URGENCY_WEIGHTS.medium;
    const hypeTotal = (request?.hype || []).reduce((sum, h) => sum + (Number(h.points) || 0), 0);
    const affectedFactor = Math.min(30, Math.floor(Math.log2((Number(request?.affectedCount) || 1) + 1) * 5));
    return urgencyWeight + hypeTotal * 5 + affectedFactor;
  }

  canVolunteerJoinRole(volunteer, roleObj, volunteerId) {
    if (!volunteer) {
      return { allowed: false, reason: 'Volunteer not found.' };
    }
    if (volunteer.status === 'suspended') {
      return { allowed: false, reason: 'Suspended volunteers cannot join missions.' };
    }
    if (!roleObj) {
      return { allowed: false, reason: 'Requested role not found in this mission.' };
    }
    const alreadyJoined = (roleObj.assignedVolunteers || []).some(
      (v) => (v?._id || v)?.toString() === volunteerId.toString()
    );
    if (alreadyJoined) {
      return { allowed: false, reason: 'You are already assigned to this role.' };
    }
    if ((roleObj.assignedVolunteers || []).length >= roleObj.count) {
      return { allowed: false, reason: 'This role is already at full capacity.' };
    }
    const matchingSkill = (volunteer.skills || []).find((s) => s.name === roleObj.role);
    if (!matchingSkill || !matchingSkill.verified) {
      return {
        allowed: false,
        reason: `You must have an NGO-verified '${roleObj.role}' skill to join this role.`,
      };
    }
    return { allowed: true, reason: null };
  }

  validateGrantAllocation(reqItem, existingGrants, ngoId, quantityApproved) {
    if (!reqItem) {
      return { valid: false, reason: 'Requirement item not found in this request.' };
    }
    const safeQty = Math.floor(Number(quantityApproved));
    if (!Number.isFinite(safeQty) || safeQty < 1) {
      return { valid: false, reason: 'Approved quantity must be at least 1.' };
    }

    const activeGrants = (existingGrants || []).filter((g) => g.status !== 'cancelled');
    const totalGranted = activeGrants.reduce((sum, g) => sum + (Number(g.quantityApproved) || 0), 0);
    const remaining = reqItem.quantity - totalGranted;

    if (remaining <= 0) {
      return { valid: false, reason: 'This requirement is already fully fulfilled by other NGOs.' };
    }

    const alreadyContributed = activeGrants.some(
      (g) => (g.ngoId?._id || g.ngoId)?.toString() === ngoId.toString()
    );
    if (alreadyContributed) {
      return { valid: false, reason: 'Your NGO has already contributed to this requirement.' };
    }

    if (safeQty > remaining) {
      return { valid: false, reason: `Exceeds remaining need. Only ${remaining} units left.` };
    }

    return { valid: true, safeQty, remainingAfter: remaining - safeQty };
  }

  formatPublicTracker(request) {
    const fulfillment = this.calculateFulfillmentSummary(request);
    const hypeTotal = (request.hype || []).reduce((sum, h) => sum + (Number(h.points) || 0), 0);

    return {
      id: request._id,
      status: request.status,
      category: request.category || 'Other',
      urgency: request.urgency || 'medium',
      affectedCount: request.affectedCount || 1,
      crisisDescription: request.crisisDescription,
      location: request.location,
      reporterName: request.publicUser?.name || request.volunteer?.name || 'Verified Field Report',
      sourceType: request.volunteer ? 'volunteer' : 'public',
      validatedBy: request.approvedBy?.name || null,
      hypeTotal,
      priorityScore: this.computePriorityScore(request),
      fulfillment,
      requirements: (request.requirements || []).map((reqItem) => {
        const activeGrants = (reqItem.grantedList || []).filter((g) => g && g.status !== 'cancelled');
        const grantedQty = activeGrants.reduce((sum, g) => sum + (Number(g.quantityApproved) || 0), 0);
        const receivedQty = activeGrants
          .filter((g) => g.isReceived)
          .reduce((sum, g) => sum + (Number(g.quantityApproved) || 0), 0);

        return {
          id: reqItem._id,
          itemName: reqItem.itemName,
          quantity: reqItem.quantity,
          description: reqItem.description,
          grantedQty,
          receivedQty,
          remainingQty: Math.max(0, reqItem.quantity - grantedQty),
          grants: activeGrants.map((g) => ({
            id: g._id,
            ngoName: g.ngoId?.name || 'Verified NGO',
            quantityApproved: g.quantityApproved,
            status: g.status,
            isReceived: g.isReceived,
            updatedAt: g.updatedAt,
          })),
        };
      }),
      requiredVolunteers: (request.requiredVolunteers || []).map((rv) => ({
        id: rv._id,
        role: rv.role,
        count: rv.count,
        assignedCount: (rv.assignedVolunteers || []).length,
      })),
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }
}

export default new HelpRequestService();
