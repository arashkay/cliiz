class SitesController < ApplicationController
  
  layout nil
  
  before_filter :firsttime_auto_login, :only => :modify
  before_filter :authenticate_company!, :only => :modify
  before_filter :detect_site

  def render_page
    unless Rails.env!='development' && File.exists?(cached_file @page)
      components = UsedComponent.all_in_page @page, @company.id
      case @page
        when CLIIZ::MENU::LISTING then
          unless params[:id].blank?
            components = UsedComponent.all_in_subpage @page, @company.id
            components[0].extra_data = ModList.find(params[:id], :conditions => { :used_component_id => @company.blog.id } )
            components[0].component.uname = 'item'
        end
        when CLIIZ::MENU::BLOG then
          unless params[:id].blank?
            post = ModBlog.find(params[:id], :conditions => { :used_component_id => @company.blog.id } )
            post.increment! :view_count
            components = UsedComponent.all_in_subpage @page, @company.id
            components[0].extra_data = post
            components[0].component.uname = 'post'
          end
        when CLIIZ::MENU::GALLERY then
          if !params[:id].blank?
            components = UsedComponent.all_in_subpage @page, @company.id
            components[0].extra_data = ModGallery.find(params[:id], :conditions => { :used_component_id => @company.gallery.id } )
            components[0].component.uname = 'image'
          else
            components[0].extra_data = ModGallery.find( :all, :conditions => { :used_component_id => @company.gallery.id }, :include => :image )
          end
        else

      end
      cnt = Generator.new.page( @page, @company, @company.frame, components, csrf_meta_tag).to_html
      cache_page cnt, cached_file_name(@page)
      render :inline => cnt
    else
      render :file => cached_file(@page), :layout => false
    end
  end

  def modify
    components = UsedComponent.all_in_page @page, @company.id
      case @page
        when CLIIZ::MENU::GALLERY then
          components[0].extra_data = ModGallery.find( :all, :conditions => { :used_component_id => @company.gallery.id }, :include => :image )
      end
    change_links_to_modify
    render :inline => Generator.new.edit_page( @page, @company, components, csrf_meta_tag).to_html
  end

private
  
  def cached_file_name(page)
    "#{@domain}/#{page}#{params[:id]||''}"
  end

  def cached_file(page)
    "#{Rails.root}/cache/#{cached_file_name(page)}.html"
  end
  
  def detect_site
    if params[:edit]
      @company = current_company
    else
      @domain = detect_domain
      @company = Company.find_by_name @domain 
      if @company.nil?
        render "/general/construction.html.erb", :layout => false
        return false
      end
    end
    @page = detect_page(@company) unless @company.nil?
  end
  
  def detect_page(company)
    unless params[:page].blank?
      page = "/#{params[:page].downcase}"
      page = @company.setting[:menu].detect{ |i| i[1]==page }
    end
    (page.nil? ? @company.setting[:menu][0] : page)[0]
  end

  def csrf_meta_tag
    %(<meta name="csrf-param" content="#{Rack::Utils.escape_html(request_forgery_protection_token)}"/>\n<meta name="csrf-token" content="#{Rack::Utils.escape_html(form_authenticity_token)}"/>)
  end

end
