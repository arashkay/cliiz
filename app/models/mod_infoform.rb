class ModInfoform < ActiveRecord::Base

  attr_accessible :used_component_id, :name, :email, :url, :phone, :phone2, :address, :subject, :message

end
