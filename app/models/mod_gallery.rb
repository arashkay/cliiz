class ModGallery < ActiveRecord::Base
 
  belongs_to :image
  has_many :mod_galleries, :foreign_key => :parent_id, :dependent => :destroy
  
  def thumb_url
    unless image.blank?
      image.thumb_url
    else
      CLIIZ::NO_IMAGE
    end
  end

end
