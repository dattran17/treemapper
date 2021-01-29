import { APIConfig } from './Config';
import axios from 'axios';
import {
  getInventoryByStatus,
  changeInventoryStatusAndResponse,
  changeInventoryStatus,
} from '../repositories/inventory';
import {
  Inventory,
  Species,
  Polygons,
  Coordinates,
  OfflineMaps,
  User,
  AddSpecies,
  ScientificSpecies,
  ActivityLogs
} from '../repositories/schema';
import Realm from 'realm';
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
import getSessionData from '../utils/sessionId';
import { updateCount, updateIsUploading } from './inventory';
import { getSpeciesList } from './species';

const { protocol, url } = APIConfig;

const changeStatusAndUpload = async (response, oneInventory, userToken, sessionData, dispatch) => {
  return new Promise((resolve, reject) => {
    try {
      if (oneInventory.locate_tree == 'off-site') {
        changeInventoryStatus(
          { inventory_id: oneInventory.inventory_id, status: 'complete' },
          dispatch,
        ).then(() => resolve());
      } else {
        const stringifiedResponse = JSON.stringify(response);
        changeInventoryStatusAndResponse(
          {
            inventory_id: oneInventory.inventory_id,
            status: 'uploading',
            response: stringifiedResponse,
          },
          dispatch,
        )
          .then(async () => {
            const result = await uploadImage(oneInventory, response, userToken, sessionData);
            if (result.allUploadCompleted) {
              changeInventoryStatus(
                {
                  inventory_id: oneInventory.inventory_id,
                  status: 'complete',
                },
                dispatch,
              )
                .then(() => resolve())
                .catch((err) => {
                  console.error(
                    `Error at: /action/upload/changeInventoryStatus, -> ${JSON.stringify(err)}`,
                  );
                  reject();
                });
            }
          })
          .catch((err) => {
            reject();
            console.error(
              `Error at: /action/upload/changeInventoryStatusAndResponse, -> ${JSON.stringify(
                err,
              )}`,
            );
          });
      }
    } catch (err) {
      reject();
      console.error(`Error at: /action/upload/changeStatusAndUpload, -> ${JSON.stringify(err)}`);
    }
  });
};

export const uploadInventory = (dispatch) => {
  return new Promise((resolve, reject) => {
    Realm.open({
      schema: [Inventory,
        Species,
        Polygons,
        Coordinates,
        OfflineMaps,
        User,
        AddSpecies,
        ScientificSpecies,
        ActivityLogs],
    })
      .then((realm) => {
        realm.write(() => {
          const user = realm.objectForPrimaryKey('User', 'id0001');
          let userToken = user.accessToken;
          try {
            // gets the current geo location coordinate of the user and passes the position forward
            Geolocation.getCurrentPosition(
              async (position) => {
                // stores the current coordinates of the user
                const currentCoords = position.coords;
                // get pending inventories from realm DB
                const pendingInventory = await getInventoryByStatus('pending');
                // get inventories whose images are pending tob be uploaded from realm DB
                const uploadingInventory = await getInventoryByStatus('uploading');
                // copies pending and uploading inventory
                let inventoryData = [...pendingInventory, ...uploadingInventory];
                let coordinates = [];
                let species = [];
                inventoryData = Object.values(inventoryData);
                // updates the count of inventories that is going to be uploaded
                updateCount({ type: 'upload', count: inventoryData.length })(dispatch);
                // changes the status of isUploading to true, to show that data started to sync
                updateIsUploading(true)(dispatch);
                // loops through the inventory data to upload the data and then the images of the same synchronously
                for (let i = 0; i < inventoryData.length; i++) {
                  const oneInventory = inventoryData[i];
                  let polygons = Object.values(oneInventory.polygons);
                  const onePolygon = polygons[0];
                  let coords = Object.values(onePolygon.coordinates);
                  coordinates = coords.map((x) => [x.longitude, x.latitude]);
                  if (oneInventory.tree_type == 'single') {
                    species = [{ otherSpecies: String(oneInventory.specei_name), treeCount: 1 }];
                  } else {
                    species = Object.values(oneInventory.species).map((x) => ({
                      otherSpecies: x.nameOfTree,
                      treeCount: Number(x.treeCount),
                    }));
                  }
                  // prepares the body which is to be passed to api
                  let body = {
                    captureMode: oneInventory.locate_tree,
                    deviceLocation: {
                      coordinates: [currentCoords.longitude, currentCoords.latitude],
                      type: 'Point',
                    },
                    geometry: {
                      type: coordinates.length > 1 ? 'Polygon' : 'Point',
                      coordinates: coordinates.length > 1 ? [coordinates] : coordinates[0],
                    },
                    plantDate: new Date().toISOString(),
                    registrationDate: new Date().toISOString(),
                    plantProject: null,
                    plantedSpecies: species,
                  };
                  await getSessionData()
                    .then(async (sessionData) => {
                      if (oneInventory.response !== null && oneInventory.status === 'uploading') {
                        const inventoryResponse = JSON.parse(oneInventory.response);
                        try {
                          const response = await getPlantLocationDetails(
                            inventoryResponse.id,
                            userToken,
                          );
                          await changeStatusAndUpload(
                            response,
                            oneInventory,
                            userToken,
                            sessionData,
                            dispatch,
                          );
                          if (inventoryData.length - 1 === i) {
                            updateIsUploading(false)(dispatch);
                            resolve();
                          }
                        } catch (err) {
                          if (inventoryData.length - 1 === i) {
                            updateIsUploading(false)(dispatch);
                            reject();
                          }
                          console.error(err);
                        }
                      } else {
                        try {
                          const data = await axios({
                            method: 'POST',
                            url: `${protocol}://${url}/treemapper/plantLocations`,
                            data: body,
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `OAuth ${userToken}`,
                              'x-session-id': sessionData,
                            },
                          });
                          if (data && data.data) {
                            await changeStatusAndUpload(
                              data.data,
                              oneInventory,
                              userToken,
                              sessionData,
                              dispatch,
                            )
                              .then(() => {
                                if (inventoryData.length - 1 === i) {
                                  updateIsUploading(false)(dispatch);
                                  resolve();
                                }
                              })
                              .catch((err) => {
                                if (inventoryData.length - 1 === i) {
                                  updateIsUploading(false)(dispatch);
                                  reject(err);
                                }
                                console.error(
                                  `Error at: /action/upload, changeStatusAndUpload -> ${JSON.stringify(
                                    err,
                                  )}`,
                                );
                              });
                          } else {
                            if (inventoryData.length - 1 === i) {
                              updateIsUploading(false)(dispatch);
                              reject(false);
                            }
                          }
                        } catch (err) {
                          if (inventoryData.length - 1 === i) {
                            updateIsUploading(false)(dispatch);
                            reject(err);
                          }
                          console.error(
                            `Error at: /action/upload, POST - /treemapper/plantLocations -> ${JSON.stringify(
                              err,
                            )}`,
                          );
                        }
                      }
                    })
                    .catch((err) => {
                      if (inventoryData.length - 1 === i) {
                        updateIsUploading(false)(dispatch);
                        reject(err);
                      }
                      console.error(
                        `Error at: /action/upload, getSessionData -> ${JSON.stringify(err)}`,
                      );
                    });
                }
              },
              (err) => alert(err.message),
            );
          } catch (err) {
            reject(err);
            alert('Unable to retrieve location');
          }
        });
      })
      .catch((err) => {});
  });
};

const uploadImage = async (oneInventory, response, userToken, sessionId) => {
  let locationId = response.id;
  let coordinatesList = Object.values(oneInventory.polygons[0].coordinates);
  let responseCoords = response.coordinates;
  let completedUploadCount = 0;
  for (let i = 0; i < responseCoords.length; i++) {
    const oneResponseCoords = responseCoords[i];

    if (oneResponseCoords.status === 'complete') {
      completedUploadCount++;
      continue;
    }
    let inventoryObject = coordinatesList[oneResponseCoords.coordinateIndex];

    const bas64Image = await RNFS.readFile(inventoryObject.imageUrl, 'base64');

    let body = {
      imageFile: `data:image/png;base64,${bas64Image}`,
    };
    let headers = {
      'Content-Type': 'application/json',
      Authorization: `OAuth ${userToken}`,
      'x-session-id': sessionId,
    };
    try {
      const result = await axios({
        method: 'PUT',
        url: `${protocol}://${url}/treemapper/plantLocations/${locationId}/coordinates/${oneResponseCoords.id}`,
        data: body,
        headers: headers,
      });

      if (result.status === 200) {
        completedUploadCount++;
      }
    } catch (err) {
      console.error(
        `Error at: action/upload/uploadImage, PUT: ${locationId}/coordinates/${
          oneResponseCoords.id
        } -> ${JSON.stringify(err)}`,
      );
    }
  }
  return { allUploadCompleted: completedUploadCount === responseCoords.length };
};

export const createSpecies = (scientificSpecies, aliases) => {
  return new Promise((resolve, reject) => {
    Realm.open({
      schema: [Inventory,
        Species,
        Polygons,
        Coordinates,
        OfflineMaps,
        User,
        AddSpecies,
        ScientificSpecies,
        ActivityLogs],
    }).then((realm) => {
      realm.write(async () => {
        const createSpeciesUser = realm.objectForPrimaryKey('User', 'id0001');
        let userToken = createSpeciesUser.accessToken;
        // await RNFS.readFile(image, 'base64').then(async (base64) => {
        let body = {
          // imageFile: `data:image/jpeg;base64,${base64}`,
          scientificSpecies,
          aliases,
        };
        await axios({
          method: 'POST',
          url: `${protocol}://${url}/treemapper/species`,
          data: body,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `OAuth ${userToken}`,
          },
        })
          .then((res) => {
            const { status, data } = res;

            if (status === 200) {
              resolve(data);
            }
          })
          .catch((err) => {
            console.error(err, 'create error');
            reject(err);
          });
      });
    });
  });
  // });
};

export const UpdateSpecies = (aliases, speciesId) => {
  return new Promise((resolve, reject) => {
    Realm.open({
      schema: [Inventory,
        Species,
        Polygons,
        Coordinates,
        OfflineMaps,
        User,
        AddSpecies,
        ScientificSpecies,
        ActivityLogs],
    }).then((realm) => {
      realm.write(async () => {
        const UpdateSpeciesUser = realm.objectForPrimaryKey('User', 'id0001');
        let userToken = UpdateSpeciesUser.accessToken;

        // await RNFS.readFile(image, 'base64').then(async (base64) => {
        let body = {
          // imageFile: `data:image/jpeg;base64,${base64}`,
          aliases,
        };
        await axios({
          method: 'PUT',
          url: `${protocol}://${url}/treemapper/species/${speciesId}`,
          data: body,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `OAuth ${userToken}`,
          },
        })
          .then((res) => {
            const { status } = res;

            if (status === 200) {
              resolve(true);
            }
          })
          .catch((err) => {
            console.error(err, 'create error');
            reject(err);
          });
        // });
      });
    });
  });
};
export const UpdateSpeciesImage = (image, speciesId) => {
  return new Promise((resolve, reject) => {
    Realm.open({
      schema: [Inventory,
        Species,
        Polygons,
        Coordinates,
        OfflineMaps,
        User,
        AddSpecies,
        ScientificSpecies,
        ActivityLogs],
    }).then((realm) => {
      realm.write(async () => {
        const UpdateSpeciesImageUser = realm.objectForPrimaryKey('User', 'id0001');
        let userToken = UpdateSpeciesImageUser.accessToken;
        await RNFS.readFile(image, 'base64').then(async (base64) => {
          let body = {
            imageFile: `data:image/jpeg;base64,${base64}`,
          };
          await axios({
            method: 'PUT',
            url: `${protocol}://${url}/treemapper/species/${speciesId}`,
            data: body,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `OAuth ${userToken}`,
            },
          })
            .then((res) => {
              const { status } = res;

              if (status === 200) {
                resolve(true);
              }
            })
            .catch((err) => {
              console.error(err, 'create error');
              reject(err);
            });
        });
      });
    });
  });
};

export const SpeciesListData = () => {
  return new Promise((resolve) => {
    Realm.open({
      schema: [Inventory,
        Species,
        Polygons,
        Coordinates,
        OfflineMaps,
        User,
        AddSpecies,
        ScientificSpecies,
        ActivityLogs],
    }).then((realm) => {
      realm.write(async () => {
        const SpeciesListDataUser = realm.objectForPrimaryKey('User', 'id0001');
        let userToken = SpeciesListDataUser.accessToken;

        getSpeciesList(userToken).then((data) => {
          resolve(data);
        });
      });
    });
  });
};

const getPlantLocationDetails = (locationId, userToken) => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'GET',
      url: `${protocol}://${url}/treemapper/plantLocations/${locationId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `OAuth ${userToken}`,
      },
    })
      .then((res) => {
        const { data, status } = res;
        if (status === 200) {
          resolve(data);
        }
      })
      .catch((err) => {
        reject(err);
        console.error(err, 'error');
      });
  });
};
