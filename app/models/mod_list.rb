class ModList < ActiveRecord::Base
  attr_accessible :commentable, :description, :image_id, :name, :price, :summary, :used_component_id, :view_count
end
