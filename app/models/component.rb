class Component < ActiveRecord::Base
  
  serialize :setting

  attr_accessible :setting, :component

  before_save :set_setting
  belongs_to :component

  scope :addables, where( { :addable => true , :is_package => false } )

  def self.package( company, component, page )
    uc = UsedComponent.new( { 
      :company_id => company.id, 
      :component_id => component.id,
      :page => page,
      :partition => 1,
      :ordering => -1,
      :disabled => false
    })
    uc.setting = component.setting
    uc.save
  end

private
  def set_setting
    self.setting = Component.default_for uname
  end

  def self.default_for(type)
    case type
      when CLIIZ::COMPONENTS::SITE
        CLIIZ::COMPONENTS::Site.setting
      when CLIIZ::COMPONENTS::CONTENT
        CLIIZ::COMPONENTS::Content.setting
      when CLIIZ::COMPONENTS::FORM
        CLIIZ::COMPONENTS::Form.setting
      when CLIIZ::COMPONENTS::MAP
        CLIIZ::COMPONENTS::Map.setting
      when CLIIZ::COMPONENTS::BLOG
        CLIIZ::COMPONENTS::Blog.setting
      when CLIIZ::COMPONENTS::POSTFILTER
        CLIIZ::COMPONENTS::PostFilter.setting
      when CLIIZ::COMPONENTS::GALLERY
        CLIIZ::COMPONENTS::Gallery.setting
      when CLIIZ::COMPONENTS::YOUTUBE
        CLIIZ::COMPONENTS::Youtube.setting
    end
  end

end
