class ModBlog < ActiveRecord::Base

  attr_accessible :title, :content, :used_component_id, :publish_date, :image_id, :image, :summary
  validates_presence_of :title, :content, :used_component_id
  before_save :add_summary
  belongs_to :image

  def thumb
    image.blank? ? '/images/noimage100.jpg' : image.entity(:thumb)
  end

private
  
  def add_summary
    self.summary = ActionController::Base.helpers.truncate(self.content.gsub(/<\/?[^>]*>/, ""), :length => 120, :omission => '...') if self.summary.blank?
  end

end
