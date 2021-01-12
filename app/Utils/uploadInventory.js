import { uploadInventory, isLogin, auth0Login } from '../Actions';

export const uploadInventoryData = (dispatch) => {
  return new Promise((resolve, reject) => {
    isLogin().then((isUserLogin) => {
      if (!isUserLogin) {
        auth0Login()
          .then((isUserLogin) => {
            isUserLogin ? resolve() : reject();
          })
          .catch((err) => {
            alert(err.error_description);
          });
      } else {
        uploadInventory(dispatch)
          .then(() => {
            resolve();
          })
          .catch((err) => {
            console.error(err);
          });
      }
    });
  });
};
