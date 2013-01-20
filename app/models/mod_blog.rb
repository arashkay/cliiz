class ModBlog < ActiveRecord::Base

  attr_accessible :title, :content, :used_component_id, :publish_date, :image_id, :image, :summary
  validates_presence_of :title, :content, :used_component_id, :publish_date
  before_save :add_summary
  belongs_to :image

  default_scope where( :trashed =>false ).order('publish_date DESC')

  def thumb
    image.blank? ? '/assets/noimage100.jpg' : image.entity(:thumb)
  end

  def human_publish_date
    publish_date.strftime "%m/%d/%Y"
  end

  def self.all_of(component_id)
    self.where( :used_component_id => component_id )
  end

private
  
  def add_summary
    self.summary = ActionController::Base.helpers.truncate(self.content.gsub(/<\/?[^>]*>/, ""), :length => 120, :omission => '...') if self.summary.blank?
  end

end
