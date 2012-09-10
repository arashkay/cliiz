class SitesController < ApplicationController
  
  layout nil

  before_filter :authenticate_company!, :only => :modify
  before_filter :detect_site, :only => :page

  def page
    if @company.setting.nil?
      @company.setting = {}
      @company.save
    end
    page = params[:page].downcase
    components = UsedComponent.all :conditions => { :page => page, :company_id => @company.id }, :order => 'partition, `ordering`'
    case page
      when 'blog' then
        unless params[:id].blank?
          components = UsedComponent.all :conditions => ["page = ? AND company_id = ? AND (partition <> 1 OR uname = 'blog')",  page, @company.id ], :order => 'partition, `ordering`', :joins => :component, :include => :component
          post = ModBlog.find(params[:id], :conditions => { :used_component_id => @company.blog.id } )
          post.increment! :view_count
          components[0].extra_data = post
          components[0].component.uname = 'post'
        end
      when 'gallery' then
        if !params[:id].blank?
          components = UsedComponent.all :conditions => ["page = ? AND company_id = ? AND (partition <> 1 OR uname = 'gallery')",  page, @company.id ], :order => 'partition, `ordering`', :joins => :component, :include => :component
          components[0].extra_data = ModGallery.find(params[:id], :conditions => { :used_component_id => @company.gallery.id } )
          components[0].component.uname = 'image'
        else
          components[0].extra_data = ModGallery.find( :all, :conditions => { :parent_id => params[:category], :used_component_id => @company.gallery.id }, :include => :image )
        end
    end
    make_sure_of_menu
    render :inline => Generator.new.page( page, @company, @company.frame, components, csrf_meta_tag).to_html
  end

  def modify
    @company = current_company
    if @company.setting.nil?
      @company.setting = {}
      @company.save
    end
    page = params[:page].downcase
    components = UsedComponent.all :conditions => { :page => page, :company_id => @company.id }, :order => 'partition, `ordering`'
    make_sure_of_menu
    @company.setting[:menu].collect!{ |i| [i[0], "/panel/edit#{i[1]}", i[2]] }
    render :inline => Generator.new.edit_page( page, @company, components, csrf_meta_tag).to_html
  end

private

  def detect_site
    @domain = (self.request.domain != 'cliiz.com'&&self.request.domain !='cliiz.local')? self.request.domain.split('.')[0] : self.request.subdomains[0]
    @company = Company.find_by_name @domain 
    if @company.blank?
      render :inline => "#{@domain} is not registered!"
      return false
    end
  end
  
  def csrf_meta_tag
    %(<meta name="csrf-param" content="#{Rack::Utils.escape_html(request_forgery_protection_token)}"/>\n<meta name="csrf-token" content="#{Rack::Utils.escape_html(form_authenticity_token)}"/>)
  end

  def make_sure_of_menu
    @company.setting[:menu] = [ ['home', '/home', 'Home'], ['about', '/about', 'About'], ['contact', '/contact', 'Contact'] ] if @company.setting[:menu].blank?
    @company.save!
  end

end
