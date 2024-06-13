import { ObjectSchema } from 'realm';
import { RealmSchema } from 'src/types/enum/db.enum';

export const PlotPlantedSpecies: ObjectSchema = {
  name: RealmSchema.PlotPlantedSpecies,
  properties: {
    tag: { type: 'string', default: '' },
    guid: { type: 'string', default: '' },
    scientific_name: { type: 'string', default: '' },
    aliases: { type: 'string', default: '' },
    count: { type: 'int', default: 1 },
    image: { type: 'string', default: '' },
    timeline: `${RealmSchema.PlantTimeline}[]`,
    planting_date: { type: 'double' },
    is_alive:  { type: 'bool', default: true},
  }
};

