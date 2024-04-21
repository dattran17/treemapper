import {RegisterFormSliceInitalState} from 'src/types/interface/slice.interface'


export const SingleTeePlantation: RegisterFormSliceInitalState = {
  form_id: '',
  key: 'single-tree-registration',
  title: 'Single Tree Plantation',
  intervention_date: 0,
  skip_intervention_form: true,
  user_type: 'normal',
  project_id: '',
  site_id: '',
  site_name: '',
  project_name: '',
  should_register_location: false,
  location_type: 'Point',
  location_title: 'Tree Location',
  coordinates: [],
  preview_blank_polygon: false,
  cover_image_url: '',
  species_required: true,
  is_multi_species: false,
  species_count_required: false,
  species_modal_message: '',
  species_modal_unit: '',
  species: [],
  tree_details_required: true,
  has_sample_trees: false,
  tree_details: [],
  form_details: [],
  meta_data: '',
  form_data: [],
  additional_data: '',
  can_be_entire_site: false,
  entire_site_selected: false,
}