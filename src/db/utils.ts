/**
 * Converts Realm Object(immutable, outside write transaction) into a javascript object(mutable everywhere)
 * @param  {any|Realm.Object} object
 */
export const getJSONFromRealmObject = (object: Realm.Object) =>object.toJSON();
