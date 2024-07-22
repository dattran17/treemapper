import { ObjectSchema } from 'realm';
import { RealmSchema } from 'src/types/enum/db.enum';

export const TreeDetail: ObjectSchema = {
  name: RealmSchema.TreeDetail,
  primaryKey: 'tree_id',
  properties: {
    tree_id: 'string',
    species_guid: 'string',
    intervention_id: 'string',
    parent_id: 'string',//remove this later
    sloc_id: 'string',
    count: 'int',
    latitude: 'double',
    longitude: 'double',
    device_latitude: 'double',
    device_longitude: 'double',
    location_accuracy: 'string',
    image_url: 'string',
    cdn_image_url: 'string',
    specie_name: 'string',
    local_name: 'string',
    specie_diameter: 'double',
    specie_height: 'double',
    tag_id: 'string',
    plantation_date: 'int',
    status_complete: 'bool',
    status: 'string',
    location_id: 'string',
    tree_type: 'string',
    additional_details: 'string',
    app_meta_data: 'string',
    hid: 'string',
    history: `${RealmSchema.PlantLocationHistory}[]`,
    remeasurement_dates: `${RealmSchema.RemeasurementDate}`,
    remeasurement_requires: 'bool',
    image_data: `${RealmSchema.Coordinates}`,
  },
};