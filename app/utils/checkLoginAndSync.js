import { auth0Logout, getNewAccessToken, getUserDetailsFromServer } from '../actions/user';
import { getUserDetails } from '../repositories/user';
import { checkAndAddUserSpecies } from '../utils/addUserSpecies';
import { uploadInventoryData } from '../utils/uploadInventory';

export const checkLoginAndSync = async ({ sync, dispatch, userDispatch, internet }) => {
  console.log(sync, internet, 'internet connection');
  const dbUserDetails = await getUserDetails();
  if (dbUserDetails && dbUserDetails.accessToken && sync && internet) {
    uploadInventoryData(dispatch, userDispatch);
  } else if (dbUserDetails && dbUserDetails.refreshToken && internet) {
    const newAccessToken = await getNewAccessToken(dbUserDetails.refreshToken);
    if (newAccessToken) {
      if (sync) {
        uploadInventoryData(dispatch, userDispatch);
      } else {
        // fetches the user details from server by passing the accessToken which is used while requesting the API
        getUserDetailsFromServer(newAccessToken);
        checkAndAddUserSpecies();
      }
    } else if (internet) {
      auth0Logout();
    }
  }
};
