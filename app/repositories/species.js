import { bugsnag } from '../utils';
import Realm from 'realm';
import { LogTypes } from '../utils/constants';
import dbLog from '../repositories/logs';
import { getSchema } from './default';

export const updateAndSyncLocalSpecies = (speciesData) => {
  return new Promise((resolve, reject) => {
    Realm.open(getSchema())
      .then((realm) => {
        realm.write(() => {
          speciesData.forEach((specie, index) => {
            realm.create('ScientificSpecies', {
              guid: specie.guid,
              scientificName: specie.scientific_name,
            });
            if (index === speciesData.length - 1) {
              // logging the success in to the db
              dbLog.info({
                logType: LogTypes.MANAGE_SPECIES,
                message: 'Successfully updated the Local Scientific species',
              });
              resolve(true);
            }
          });
        });
      })
      .catch((err) => {
        dbLog.error({
          logType: LogTypes.MANAGE_SPECIES,
          message: 'Error while updating the Local Scientific species',
          logStack: JSON.stringify(err),
        });
        console.error(
          `Error at /repositories/species/updateAndSyncLocalSpecies, ${JSON.stringify(err)}`,
        );
        bugsnag.notify(err);
        reject(err);
      });
  });
};

export const searchSpeciesFromLocal = (text) => {
  return new Promise((resolve, reject) => {
    Realm.open(getSchema())
      .then((realm) => {
        let species = realm.objects('ScientificSpecies');
        let searchedSpecies = species.filtered(`scientificName BEGINSWITH[c] '${text}'`);
        searchedSpecies = searchedSpecies.sorted('scientificName');
        // logging the success in to the db
        dbLog.info({
          logType: LogTypes.MANAGE_SPECIES,
          message: `Searching in Local Scientific species with text:${text}`,
        });
        resolve(searchedSpecies);
      })
      .catch((err) => {
        dbLog.error({
          logType: LogTypes.MANAGE_SPECIES,
          message: `Error while searching in Local Scientific species with text:${text}`,
          logStack: JSON.stringify(err),
        });
        console.error(
          `Error at /repositories/species/searchSpeciesFromLocal, ${JSON.stringify(err)}`,
        );
        bugsnag.notify(err);
        reject(err);
      });
  });
};

export const getUserSpecies = () => {
  return new Promise((resolve, reject) => {
    Realm.open(getSchema())
      .then((realm) => {
        let species = realm.objects('ScientificSpecies');
        let userSpecies = species.filtered('isUserSpecies = true');
        userSpecies = userSpecies.sorted('scientificName');
        // logging the success in to the db
        dbLog.info({
          logType: LogTypes.MANAGE_SPECIES,
          message: 'Retrieved User Species from Local',
        });
        resolve(userSpecies);
      })
      .catch((err) => {
        dbLog.error({
          logType: LogTypes.MANAGE_SPECIES,
          message: 'Error while retrieving User Species from Local',
          logStack: JSON.stringify(err),
        });
        console.error(`Error at /repositories/species/getUserSpecies, ${JSON.stringify(err)}`);
        bugsnag.notify(err);
        reject(err);
      });
  });
};

/**
 * Gets all the user preferred species which are not synced with server.
 * It filters the [ScientificSpecies] model with conditions [isUserSpecies = true]
 * and [isUploaded = false]
 * @param {Array} alreadySyncedSpecies - contains the list of already synced user's preferred species
 */
export const updateAndGetUserSpeciesToSync = (alreadySyncedSpecies) => {
  return new Promise((resolve, reject) => {
    Realm.open(getSchema())
      .then((realm) => {
        if (alreadySyncedSpecies) {
          // iterates through all the user preferred species which are already synced and updates the same in DB
          realm.write(() => {
            for (const specie of alreadySyncedSpecies) {
              // find the scientific specie using scientific specie guid and update the properties to
              // [isUploaded = true] and [isUserSpecies = true]
              let specieResult = realm.objectForPrimaryKey(
                'ScientificSpecies',
                specie.scientificSpecies,
              );
              specieResult.isUploaded = true;
              specieResult.isUserSpecies = true;
              specieResult.specieId = specie.id;
              // logging the success in to the db
              dbLog.info({
                logType: LogTypes.MANAGE_SPECIES,
                message: `Marked local specie with guid: ${specie.scientificSpecies} as isUserSpecies and isUploaded`,
              });
            }
          });
          // logging the success in to the db
          dbLog.info({
            logType: LogTypes.MANAGE_SPECIES,
            message: 'Updated all the local species with already synced species from server',
          });
        } else {
          // logging the success in to the db
          dbLog.info({
            logType: LogTypes.MANAGE_SPECIES,
            message: 'No synced species found from server',
          });
        }

        // fetches all the scientific species
        let species = realm.objects('ScientificSpecies');

        // filters by [isUserSpecies = true] OR [isUploaded = true] to get species to sync to server
        let userSpeciesToSync = species.filtered('isUserSpecies = true || isUploaded = true');

        // logging the success in to the db
        dbLog.info({
          logType: LogTypes.MANAGE_SPECIES,
          message: 'Fetched not uploaded user species from DB',
        });
        resolve(userSpeciesToSync);
      })
      .catch((err) => {
        dbLog.error({
          logType: LogTypes.MANAGE_SPECIES,
          message: 'Error while retrieving not uploaded user Species',
          logStack: JSON.stringify(err),
        });
        console.error(
          `Error at /repositories/species/updateAndGetUserSpeciesToSync, ${JSON.stringify(err)}`,
        );
        bugsnag.notify(err);
        reject(err);
      });
  });
};

/**
 * This function is used when specie is already uploaded on the server.
 * Used to add specie id to scientific species using scientific species guid
 * @param {string} scientificSpecieGuid - scientific specie guid to search from and update the specie id
 * @param {string} specieId - specie id which is to be updated
 */
export const addSpecieIdFromSyncedSpecie = (scientificSpecieGuid, specieId) => {
  return new Promise((resolve, reject) => {
    Realm.open(getSchema())
      .then((realm) => {
        realm.write(() => {
          // find the scientific specie using scientific specie guid and updates the specieId
          // modifies [isUploaded] and [isUserSpecies] to [true]
          let specieResult = realm.objectForPrimaryKey('ScientificSpecies', scientificSpecieGuid);
          specieResult.specieId = specieId;
          specieResult.isUploaded = true;
          specieResult.isUserSpecies = true;
        });
        // logging the success in to the db
        dbLog.info({
          logType: LogTypes.MANAGE_SPECIES,
          message: `Added specie id from already synced specie with scientific specie guid: ${scientificSpecieGuid} and specie id: ${specieId}`,
        });
        resolve(true);
      })
      .catch((err) => {
        dbLog.error({
          logType: LogTypes.MANAGE_SPECIES,
          message: `Error while adding specie id from already synced specie with scientific specie guid: ${scientificSpecieGuid} and specie id: ${specieId}`,
          logStack: JSON.stringify(err),
        });
        console.error(
          `Error at /repositories/species/addSpecieIdFromSyncedSpecie, ${JSON.stringify(err)}`,
        );
        bugsnag.notify(err);
        reject(err);
      });
  });
};

/**
 * This function is used when specie is deleted from the server.
 * Used to remove specie id from scientific species using scientific species guid and set
 * [isUploaded] and [isUserSpecies] to [false]
 * @param {string} scientificSpecieGuid - scientific specie guid to search from and update the specie id
 */
export const removeSpecieId = (scientificSpecieGuid) => {
  return new Promise((resolve, reject) => {
    Realm.open(getSchema())
      .then((realm) => {
        realm.write(() => {
          // find the scientific specie using scientific specie guid and updates the specieId to empty string,
          // modifies [isUploaded] and [isUserSpecies] to [false]
          let specieResult = realm.objectForPrimaryKey('ScientificSpecies', scientificSpecieGuid);
          specieResult.specieId = '';
          specieResult.isUploaded = false;
          specieResult.isUserSpecies = false;
        });
        // logging the success in to the db
        dbLog.info({
          logType: LogTypes.MANAGE_SPECIES,
          message: `Removed specie id having scientific specie guid: ${scientificSpecieGuid}`,
        });
        resolve(true);
      })
      .catch((err) => {
        dbLog.error({
          logType: LogTypes.MANAGE_SPECIES,
          message: `Error while removing specie id having scientific specie guid: ${scientificSpecieGuid}`,
          logStack: JSON.stringify(err),
        });
        console.error(`Error at /repositories/species/removeSpecieId, ${JSON.stringify(err)}`);
        bugsnag.notify(err);
        reject(err);
      });
  });
};
