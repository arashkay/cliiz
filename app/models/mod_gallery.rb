class ModGallery < ActiveRecord::Base
 
  attr_accessible :image, :image_id, :title
  belongs_to :image
  has_many :mod_galleries, :foreign_key => :parent_id, :dependent => :destroy

  default_scope order("created_at DESC")
  
  def thumb_url
    unless image.blank?
      image.thumb_url
    else
      CLIIZ::NO_IMAGE
    end
  end

end
