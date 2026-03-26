import grantedHelpRepository from '../repository/grantedHelpRepository.js';

export const grantHelp = async (req, res, next) => {
  try {
    // console.log("data here  : " , req.body);
    const { quantityApproved, ngoId, requirementId, helpRequestId } = req.body;

    const grantedData = {
      quantityApproved,
      ngoId,
      requirementId,
      helpRequestId,
      status: 'pending'
    };

    const newGrant = await grantedHelpRepository.createGrantedHelp(grantedData);

    res.status(201).json({
      message: 'Help granted successfully',
      grant: newGrant
    });
  } catch (error) {
    next(error);
  }
};

export const getGrantsByNGO = async (req, res, next) => {
  try {
    const { ngoId } = req.params;

    const grants = await grantedHelpRepository.getGrantedHelpByNGO(ngoId);

    res.status(200).json(grants);
  } catch (error) {
    next(error);
  }
};

export const updateGrantStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedGrant =
      await grantedHelpRepository.updateGrantedHelpStatus(id, status);

    res.status(200).json({
      message: 'Grant status updated',
      grant: updatedGrant
    });
  } catch (error) {
    next(error);
  }
};