class Company < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable

  serialize :setting
  validates_uniqueness_of :name

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  
  belongs_to :frame
  has_many :images
  has_many :used_components
  has_many :enabled_packages, 
    :through => :used_components, 
    :source => :component, 
    :conditions => 'is_package = true AND disabled = false'
  has_many :packages, 
    :through => :used_components, 
    :source => :component, 
    :conditions => { :is_package => true }

  before_create :set_setting
  after_create :default_content
  
  def add_to_menu(name)
    self.setting[:menu].reject!{ |i| i[0]==name }
    self.setting[:menu] << case name
      when CLIIZ::COMPONENTS::BLOG
        CLIIZ::MENU::get_item CLIIZ::MENU::BLOG
      when CLIIZ::COMPONENTS::GALLERY
        CLIIZ::MENU::get_item CLIIZ::MENU::GALLERY
    end
    save
  end

  def remove_from_menu(name)
    self.setting[:menu].reject!{ |i| i[0]==name }
    self.save
  end

  def blog
    UsedComponent.first :conditions => { :company_id => id, :components => { :uname => 'blog' } }, :joins => :component
  end
 
  def gallery
    UsedComponent.first :conditions => { :company_id => id, :components => { :uname => 'gallery' } }, :joins => :component
  end

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :name, :frame_id, :setting, :domain, :first_edit_done

private
  def set_setting
    self.setting = { :menu => CLIIZ::MENU::DEFAULT,
        :display_name       => self.name, 
        :logo               => nil, 
        :description        => nil, 
        :keywords           => nil,
        :twitter            => nil,
        :facebookpage       => nil,
        :google_verify      => nil,
        :google_analytic    => nil }
  end

  def default_content
    [CLIIZ::MENU::HOME,CLIIZ::MENU::CONTACT,CLIIZ::MENU::ABOUT].each do |page|
      uc = UsedComponent.mock_start
      uc.company_id = self.id
      uc.page = page
      uc.ordering = 1
      uc.save
      uc = UsedComponent.mock_features
      uc.company_id = self.id
      uc.page = page
      uc.ordering = 2
      uc.save
    end
  end

end
