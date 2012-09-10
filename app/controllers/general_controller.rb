class GeneralController < ApplicationController

  before_filter :authenticate_company!, :except => [:index, :panel, :js_config,:notify, :designers, :how_to_design, :plans]

  before_filter :is_in_progress, :only => [ :save_domain, :check_domain ]

  def index
    @frames = Frame.all :conditions => { :is_private => false }, :order => '`order` DESC'
    #@components = Component.all :conditions => { :uname => [:sitebuilder, :content, :infoform] }
    render :index, :layout => nil
  end
  
  def plans
    @frames = Frame.all :conditions => { :is_private => false }, :order => '`order` DESC', :limit => 10
    render :layout => 'main'
  end

  def panel
    if company_signed_in?
      @modules = UsedComponent.all :select => '*, count(id) as total', :conditions => { :company_id => current_company.id }, :group => 'component_id'
      render 'welcome'
    else
      render 'panel'
    end
  end
  
  def pay
    @company = current_company
  end

  def notify
    company = Company.find_by_name params[:custom]
    Payment.create :company_id => company.id, :transaction_info => params
    render :text => ''
  end

  def save_domain
    current_company.update_attributes :domain => params[:domain]
    render :json => { :own => true, :domain => params[:domain] }
  end

  def check_domain
    domain = params[:domain]
    require 'socket'
    require 'digest/md5'
    sock = TCPSocket.open( 'www.onlinenic.com', 30009)
    res = sock.recv 300
    uid = "#{UUIDTools::UUID.timestamp_create}"
    #login
    key = "573119c6fe72a965729badf33f1d8df9a0a9a2#{uid}login" #  '573119#{Digest::MD5.hexdigest( password )}#{uid}login'
    md5 = Digest::MD5.hexdigest key
    login_message = <<-eos
    <?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <request>
    <category>client</category>
    <action>Login</action>
    <params>
    <param name="clid">573119</param>
    </params>
    <cltrid>#{uid}</cltrid>
    <chksum>#{md5}</chksum>
    </request>
        eos
    sock.send login_message, 400
    sock.recv 400
    #check
    key = "573119c6fe72a965729badf33f1d8df9a0a9a20#{uid}checkdomain0#{domain}"
    md5 = Digest::MD5.hexdigest key
    check_message = <<-eos
    <?xml version="1.0"?>
    <request>
    <category> domain </category>
    <action> CheckDomain </action>
    <params>
    <param name="domaintype">0</param>
    <param name="domain">#{domain}</param>
    </params>
    <cltrid>0#{uid}</cltrid>
    <chksum>#{md5}</chksum>
    </request>
        eos
    sock.send check_message, 400
    xml = sock.recv 500
    xml = Nokogiri::XML::Document.parse xml
    #logout
    key = "573119c6fe72a965729badf33f1d8df9a0a9a21#{uid}logout"
    md5 = Digest::MD5.hexdigest key
    logout_message = <<-eos
    <?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <request>
    <category>client</category>
    <action>Logout</action>
    <cltrid>1#{uid}</cltrid>
    <chksum>#{md5}</chksum>
    </request>
        eos
    sock.send logout_message, 400
    current_company.update_attributes(:domain => domain) if(xml.at_css('[name=avail]').text == '1')
    render :json => { :available => (xml.at_css('[name=avail]').text == '1'), :domain => params[:domain] }
  end

  def js_config
    render 'js_config.js' , :content_type => 'text/javascript', :layout => nil
  end

private
  def is_in_progress
    if current_company.is_locked == true
      render :json => { :in_progress => true }
      return false
    end
    true
  end

end
