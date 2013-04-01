class Company < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable

  serialize :setting
  validates_uniqueness_of :name

  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable

  attr_accessible :email, :password, :password_confirmation, :remember_me, :name, :frame_id, :domain, :is_locked, :first_edit_done
  
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

  before_create :set_setting, :set_frame
  after_create :default_content
  
  def add_to_menu(name)
    setting[:menu].detect{ |i| i[0]==name }[3] = true
    save
  end

  def remove_from_menu(name)
    setting[:menu].detect{ |i| i[0]==name }[3] = false
    save
  end

  def delete_from_menu(name)
    puts "delete #{name}"
  end

  def blog
    UsedComponent.first :conditions => { :company_id => id, :components => { :uname => CLIIZ::COMPONENTS::BLOG } }, :joins => :component
  end

  def listing
    UsedComponent.first :conditions => { :company_id => id, :components => { :uname => CLIIZ::COMPONENTS::LISTING } }, :joins => :component
  end
 
  def gallery
    UsedComponent.first :conditions => { :company_id => id, :components => { :uname => CLIIZ::COMPONENTS::GALLERY } }, :joins => :component
  end

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :name, :frame_id, :setting, :domain, :first_edit_done

  def update_menu(items)
    setting[:menu] = items.sort.map{ |i| i[1]['menu'] }.map do |i|
      if i['delete']=='true' && !CLIIZ::MENU::FROZEN.include?(i['uname'])
        delete_from_menu(i['uname']) 
        nil
      else
        if CLIIZ::MENU::PACKAGES.include?(i['uname'])
          (i['disable']!="true") ? UsedComponent.enable_package( self, i['uname'] ) : UsedComponent.disable_package( self, i['uname'] )
        end
        name = i['uname'].blank? ? "dynpage-#{items.size-CLIIZ::MENU::FROZEN.size}": i['uname']
        page = [ name, "/#{i['name'].parameterize.underscore}", i['name'], i['disable']!="true" ]
        page
      end
    end
    setting[:menu].compact!
    save
  end

  def folder(name)
    return Folder.new if name.blank? || name == 'null'
    folder = Folder.where( :company_id => id, :name => name ).first()
    folder = Folder.create( :company_id => id, :name => name ) if folder.blank?
    folder
  end

  def upgrade
    first_edit_done = false
    save
    CompanyMailer.upgrade_email(self).deliver
  end

  private
    def set_frame
      self.frame_id = Frame.last.id
    end

    def set_setting
      self.setting = { :menu => CLIIZ::MENU::ITEMS,
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
