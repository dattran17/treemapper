import {RegisterFormSliceInitalState} from 'src/types/interface/slice.interface'


export const MultiTreePlantation: RegisterFormSliceInitalState = {
  form_id: '',
  key: 'multi-tree-registration',
  title: 'Multi Tree Plantation',
  intervention_date: 0,
  skip_intervention_form: true,
  user_type: 'normal',
  project_id: '',
  site_id: '',
  site_name: '',
  project_name: '',
  location_type: 'Polygon',
  location_title: 'Select Location',
  coordinates: [],
  preview_blank_polygon: true,
  cover_image_url: '',
  species_required: true,
  is_multi_species: true,
  species_count_required: true,
  species_modal_message: '',
  species_modal_unit: '',
  species: [],
  tree_details_required: true,
  has_sample_trees: true,
  tree_details: [],
  form_details: [],
  meta_data: '{}',
  form_data: [],
  additional_data: [],
  can_be_entire_site: false,
  entire_site_selected: false,
  should_register_location: false,
  plantedSpecies: []
}
