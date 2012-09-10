class Image < ActiveRecord::Base

  has_attached_file :entity, :styles => { :medium => '300x300>', :large => '500x500>', :thumb => '100x100#'}, :url => '/files/images/:id/:style/:filename'

  belongs_to :company

  validates_presence_of :company_id

  def thumb_url
    self.entity.url :thumb
  end

end
