class UsedComponent < ActiveRecord::Base

  attr_accessible :partition, :component, :company, :setting, :component_id, :company_id, :disabled, :ordering, :page
  
  belongs_to :company
  belongs_to :component

  serialize :setting

  before_save :set_id

  attr_accessor :extra_data
  default_scope order('partition, `ordering`')

  def self.all_in_page(page, company_id)
    where( :page => page, :company_id => company_id )
  end

  def self.all_in_subpage(page, company_id)
    #where( ["page = ? AND company_id = ? AND (partition <> 1 OR uname = 'gallery')",  page, company_id ] ).includes(:component).joins(:component)
    where( ["page = ? AND company_id = ?",  page, company_id ] ).includes(:component)
  end

  def self.disable_package( company, name )
    uc = UsedComponent.first :conditions => ['company_id = ? and components.uname = ?' , company.id, name ], :include => :component
    uc.update_attributes :disabled => true unless uc.blank?
    company.remove_from_menu uc.component.uname
  end

  def self.enable_package( company, name )
    uc = UsedComponent.first :conditions => ['company_id = ? and components.uname = ?' , company.id, name ], :include => :component
    component = Component.find_by_uname(name)
    unless component.blank?
      if uc.blank?
        case component.uname
          when CLIIZ::COMPONENTS::BLOG
            Component.package company, component, CLIIZ::MENU::BLOG
          when CLIIZ::COMPONENTS::GALLERY
            Component.package company, component, CLIIZ::MENU::GALLERY
          when CLIIZ::COMPONENTS::LISTING
            Component.package company, component, CLIIZ::MENU::LISTING
        end
      else
        uc.update_attributes :disabled => false
      end
      company.add_to_menu component.uname
    else
      false
    end
  end

  def setting=(setting)
    if setting.empty?
      write_attribute :setting, setting
    else
      case component.uname
        when CLIIZ::COMPONENTS::CONTENT
          write_attribute :setting, { :content => setting[:content] }
        when CLIIZ::COMPONENTS::FORM
          write_attribute :setting, { :fields => setting[:fields].keys_to_int, :submit => CLIIZ::COMPONENTS::Form.setting[:submit], :message => CLIIZ::COMPONENTS::Form.setting[:message] }
        when CLIIZ::COMPONENTS::BLOG
          write_attribute :setting, setting
        when CLIIZ::COMPONENTS::GALLERY
          write_attribute :setting, setting
        when CLIIZ::COMPONENTS::POSTFILTER
          write_attribute :setting, { :size => setting[:size], :type => setting[:type], :tags => '' }
        when CLIIZ::COMPONENTS::MAP
          write_attribute :setting, (setting.reject{ |k,v| !%w(address latlng phone fax viewport).include?(k) }).keys_to_sym
        when CLIIZ::COMPONENTS::YOUTUBE
          write_attribute :setting, { :width => setting[:width], :height => setting[:height], :code => setting[:code] }
        when CLIIZ::COMPONENTS::LISTING
          write_attribute :setting, setting
        else
          write_attribute :setting, setting
      end
    end
  end

  def self.mock_start(partition=1)
    content = <<-contentBlock
          <h1>Welcome to your website</h1>
          <p>
          This website is fully dynamic, it means you can edit this content and replace it with your wise words. <b>(This automatically generated content might not be sitted properly, start changing it now by logging in to <a href='/panel'>your account</a>.</b>
          </p>
          <h3>Don't have time?</h3>
          <p>If you are too busy, ask our friendly staffs to set up your website for you. <a href='http://www.cliiz.com'>Check it here.</a></p>
      contentBlock
    cnt = UsedComponent.mock_content(content, partition)
  end

  def self.mock_features(partition=1)
    content = <<-contentBlock
        <h3>Your website features:</h3>
        <ul>
          <li>Editable Home, Contact and About pages</li>
          <li>Blog System</li>
          <li>Image Gallery</li>
          <li>Unlimited Design Change</li>
          <li>Business Locator Map</li>
          <li>Embed Youtube Videos</li>
          <li>Your Business Domain</li>
          <li>Free Storage</li>
          <li>E-Shop</li>
        </ul>
      contentBlock
    cnt = UsedComponent.mock_content(content, partition)
  end

  def self.mock_welcome(partition=1)
    content = <<-contentBlock
          <h1>Welcome to your website</h1>
          <p>
          Welcome to your future website. This website is fully dynamic, it means you can edit this content and replace it with your wise words. <br/>
          <b>(Please consider this automatically generated content is only for your preview and might not be sitted properly, sure you can organise it much nicer.).</b>
          </p>
          <p>
            If you are already registered, start editing this page by logging in to <a href='/panel'>your account</a>, otherwise <a href="http://www.cliiz.com#start">signup right now here</a> and start one of our free or paid packages.
          </p>
          <h3>Your website features:</h3>
          <ul>
            <li>Editable Home, Contact and About pages</li>
            <li>Blog System</li>
            <li>Image Gallery</li>
            <li>Unlimited Design Change</li>
            <li>Business Locator Map</li>
            <li>Embed Youtube Videos</li>
            <li>Your Business Domain</li>
            <li>Free Storage</li>
            <li>E-Shop</li>
          </ul>
          <h3>Don't have time?</h3>
          <p>If you are too busy, ask our friendly staffs to set up your website for you. <a href='http://www.cliiz.com'>Check it here.</a></p>
      contentBlock
    cnt = UsedComponent.mock_content(content, partition)
  end

  def self.mock_website_importance(partition=2)
    content = <<-contentBlock
        <h3>More than 90% of Purchase Decisions start with an Online Search</h3>
        <p>In order to gain new customers you need to understand where your prospects go when they are looking to find suppliers, research suppliers and make a purchase. In today's world the place where most people in most markets go is to the internet, specifically a search engine like Google, Yahoo, Bing.</p>
        <p>Having a website for your business gives you <b>"Professionalism"</b> and give your customers <b>"Ease Of Access"</b>. It's like having your business open to customers and prospects 24hrs.</p>
      contentBlock
    cnt = UsedComponent.mock_content(content, partition)
  end

  def self.mock_map_contact(partition=3)
    content = <<-contentBlock
      <h3>Contact Us</h3>
      <p>
        Email <b>you@yourBusinessName.com</b><br/>
        Phone <b>+00 1234 5678</b><br/>
        Your address can be here too...
      </p><br/>
      contentBlock
    cnt = UsedComponent.mock_content(content, partition)
  end

  def self.mock_content(content, partition=1)
    cnt = UsedComponent.new( :component => Component.find_by_uname(CLIIZ::COMPONENTS::CONTENT), :partition => partition )
    cnt[:setting] = { :content => content }
    cnt
  end

  def self.mock_map(company, partition=3)
    map = UsedComponent.new( :component => Component.find_by_uname(CLIIZ::COMPONENTS::MAP), :partition => partition, :company => company )
    map[:setting] = CLIIZ::COMPONENTS::Map.setting
    map
  end

private
  def set_id
    self.uid = UUIDTools::UUID.random_create.to_s
  end
  
end
