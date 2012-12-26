class ModList < ActiveRecord::Base
  attr_accessible :commentable, :description, :image_id, :name, :price, :summary, :used_component_id, :view_count
  validates_presence_of :name, :description, :used_component_id
  before_save :add_summary
  belongs_to :image

  def thumb
    image.blank? ? '/assets/noimage100.jpg' : image.entity(:thumb)
  end

private
  
  def add_summary
    self.summary = ActionController::Base.helpers.truncate(self.description.gsub(/<\/?[^>]*>/, ""), :length => 120, :omission => '...') if self.summary.blank?
  end

end
