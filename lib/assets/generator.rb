class Generator
  
  def page(type, company, layout, components, security_tag)
    @scripts = [
      '<link href="/stylesheets/modules_base.css" media="screen" rel="stylesheet" type="text/css">',
      "<script src='/modules/jquery.js' type='text/javascript'></script>",
      "<script src='/coreapi/modules/base.js' type='text/javascript'></script>"
    ]
    @company = company
    @scripts << security_tag
    google_tags
    @doc = Nokogiri::HTML get_layout(type, layout)
    content_unless "title", company.setting[:display_name] || company.name
    content_unless "[data-info=name]", company.setting[:display_name] || company.name
    attr_unless("[data-info=logo]", 'style', "background-image: url(#{company.setting[:logo]});") unless company.setting[:logo].blank?
    attr_unless "meta[name=description]", 'content', company.setting[:description] || CLIIZ::COMPANY::DESCRIPTION
    attr_unless "meta[name=keywords]", 'content', company.setting[:keywords] || CLIIZ::COMPANY::KEYWORDS
    attr_unless "[data-twitter=follow]", 'href', "http://twitter.com/#{company.setting[:twitter]}" || CLIIZ::COMPANY::TWITTER
    attr_unless "[data-facebook=follow]", 'href', company.setting[:facebookpage] || CLIIZ::COMPANY::FACEBOOK
    facebook_like
    added_scripts = []
    components.each do |c|
      p = @doc.at_css("[data-partition='#{c.partition}']")
      unless c.component.setting[:config].blank? || c.component.setting[:config][:js].blank? || added_scripts.include?(c.component.setting[:config][:js])
        @scripts <<  "<script src='/modules/#{c.component.setting[:config][:js]}' type='text/javascript'></script>"
        added_scripts << c.component.setting[:config][:js]
      end
      if p.blank?
        @doc.at_css("[data-partition='1']").inner_html += create_block c
      else
        p.inner_html += create_block c
      end
    end
    @scripts <<  "<script src='http://maps.googleapis.com/maps/api/js?sensor=false' type='text/javascript'></script>" if added_scripts.include? 'location.js'
    head = @doc.at_css('head')
    head.inner_html = @scripts.join("\n") + head.inner_html
    menu company.setting[:menu]
  end

  def edit_page(type, company, components, security_tag)
    layout = which_layout company
    edit_scripts = %(
      <link href="/assets/editor.css" media="screen" rel="stylesheet" type="text/css">
      <link href="/assets/core/ui/ui.css" media="screen" rel="stylesheet" type="text/css">
      <script src='/assets/core/jquery.ui.min.js' type='text/javascript'></script>
      <script src='/assets/core/jquery.fileupload.js' type='text/javascript'></script>
      <script src='/assets/core/jquery.datepicker.min.js' type='text/javascript'></script>
      
      <link href='/assets/core/editor/jquery.wysiwyg.css' media='screen' rel='stylesheet' type='text/css' />
      <script src='/assets/core/editor/jquery.wysiwyg.js' type='text/javascript'></script>
      <script src='/assets/core/editor/wysiwyg.image.js' type='text/javascript'></script>
      <script src='/assets/core/jquery.extension.js' type='text/javascript'></script>
      <script src='/assets/core/template.js' type='text/javascript'></script>
      <script src='/assets/core.js' type='text/javascript'></script>
      <script src='/coreapi/javascripts/config.js' type='text/javascript'></script>
      <script src='http://maps.googleapis.com/maps/api/js?sensor=false' type='text/javascript'></script>

      <script src='/assets/editor.js' type='text/javascript'></script>)
    @doc = page type, company, layout, components, security_tag
    add_editor company, components, type
    @doc.at_css('head').inner_html += edit_scripts
    @doc
  end
  
  def get_layout(type, frame)
    case type
      when CLIIZ::MENU::HOME
        frame.home.blank? ? frame.default : frame.home
      when CLIIZ::MENU::ABOUT
        frame.about.blank? ? frame.default : frame.about
      when CLIIZ::MENU::CONTACT
        frame.contact.blank? ? frame.default : frame.contact
      else
        frame.default
    end
  end

  def create_block(component)
    case component.component.uname
      when CLIIZ::COMPONENTS::CONTENT
        content_block(component)
      when CLIIZ::COMPONENTS::FORM
        infoform_block(component)
      when CLIIZ::COMPONENTS::MAP
        locationmark_block(component)
      when CLIIZ::COMPONENTS::LISTING
        list_block(component)
      when CLIIZ::COMPONENTS::ITEM
        item_block(component)
      when CLIIZ::COMPONENTS::BLOG
        blog_block(component)
      when CLIIZ::COMPONENTS::POST
        post_block(component)
      when CLIIZ::COMPONENTS::POSTFILTER
        postfilter_block(component)
      when CLIIZ::COMPONENTS::GALLERY
        gallery_block(component)
      when CLIIZ::COMPONENTS::IMAGE
        image_block(component)
      when CLIIZ::COMPONENTS::YOUTUBE
        youtube_block(component)
      else
        ''
    end
  end

  def generate_menu(company)
    layout = which_layout company
    @doc = Nokogiri::HTML get_layout(CLIIZ::MENU::HOME, layout)
    menu company.setting[:menu]
    @doc.css('[data-cliiz=menu]').to_html
  end

  private

  def which_layout(company)
    company.setting[:temp_frame_id].blank? ? company.frame : Frame.find( company.setting[:temp_frame_id] )
  end
 
  def menu(menu_items)
    menu = menu_items.reject{ |i| !i[3] }
    menu_str = ''
    @doc.css('[data-cliiz=menu]').each do |m|
      menu_str = item_replace m.css('[data-menu=first]') , menu.first
      mid = menu[ 1, menu.size-2 ]
      mid.each { |i| menu_str += item_replace m.css('[data-menu=loop]'), i } unless mid.blank?
      menu_str += item_replace m.css('[data-menu=last]'), menu.last
      m.inner_html = menu_str
    end
    h = {}
    menu.each { |i|  h[i[0]] = i[1] }
    @doc.css( '[cliiz-link]' ).each do |m|
      item = CLIIZ::MENU.get_item(m.attr('cliiz-link').downcase)
      m.set_attribute('href', h[item[0]]) unless item.blank?
    end
    @doc
  end

  def content_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/content/block', :locals => { :setting => setting(c), :uid => c.uid }
  end
   
  def infoform_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/infoform/block', :locals => { :setting => setting(c), :uid => c.uid }
  end
 
  def locationmark_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/locationmark/block', :locals => { :setting => setting(c), :uid => c.uid, :company => c.company }
  end

  def list_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/list/block', :locals => { :setting => setting(c), :uid => c.uid, :items => ModList.all(:conditions => { :used_component_id => c.id } , :order => 'created_at DESC') }
  end

  def item_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/list/item', :locals => { :item => c.extra_data }
  end

  def blog_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/blog/block', :locals => { :setting => setting(c), :uid => c.uid, :posts => ModBlog.all_of(c.id) }
  end

  def post_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/blog/post', :locals => { :post => c.extra_data }
  end

  def postfilter_block(c)
    blog = c.company.blog
    setting = setting(c)
    unless blog.blank?
      case setting[:type]
        when CLIIZ::COMPONENTS::PostFilter::MOSTREAD
          posts = ModBlog.all(:conditions => { :used_component_id => blog.id, :trashed =>false}, :limit => setting[:size], :order => 'view_count DESC')
        when CLIIZ::COMPONENTS::PostFilter::RANDOM
          posts = ModBlog.all(:conditions => { :used_component_id => blog.id, :trashed =>false}, :limit => setting[:size], :order => 'RAND()')
        else
          posts = ModBlog.all(:conditions => { :used_component_id => blog.id, :trashed =>false}, :limit => setting[:size], :order => 'publish_date DESC')
      end
    end
    ActionController::Base.new.send :render_to_string, '/modules/blog/filtered', :locals => { :setting => setting(c), :uid => c.uid, :posts => posts }
  end

  def gallery_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/gallery/block', :locals => { :setting => setting(c), :uid => c.uid, :items => c.extra_data }
  end

  def image_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/gallery/image', :locals => { :image => c.extra_data }
  end

  def youtube_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/3dparty/youtube', :locals => { :setting => setting(c), :uid => c.uid }
  end

  def attr_unless(selector, attr, value)
    @doc.at_css(selector).set_attribute( attr, value ) unless @doc.at_css(selector).nil?
  end

  def content_unless(selector, value)
    @doc.at_css(selector).content = value unless @doc.at_css(selector).nil?
  end

  def setting(c)
    c.component.setting.deep_merge c.setting
  end
  
  def add_editor( company, components, type )
    @doc.at_css('body').add_child ActionController::Base.new.send(:render_to_string, "/general/_editor", :locals => { 
      :company => company,
      :frames => Frame.all( :conditions => { :is_private => false }, :order => '`order` DESC' ), 
      :packages => Component.all( :conditions => { :is_package => true } ), 
      :used_packages => company.enabled_packages,
      :components => components.to_json(:include => { :component => { :only => :uname } }, :only => [:uid, :setting] ), 
      :i18n => Component.default_for('infoform')[:config][:types],
      :page => type
    })
  end

  def google_tags
    @scripts << "<meta name='google-site-verification' content='#{@company.setting[:google_verify]}' />" unless @company.setting[:google_verify].blank?
    @scripts << "<script type='text/javascript'>var _gaq = _gaq || [];_gaq.push(['_setAccount', '#{@company.setting[:google_analytic]}']);_gaq.push(['_trackPageview']);(function() {var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);})();</script>" unless @company.setting[:google_analytic].blank?
  end

  def facebook_like
    like = @doc.at_css("[data-facebook=like]")
    unless like.nil?
      like.set_attribute 'data-href', ((@company.setting[:facebookpage].blank?)? "http://#{@company.name}.cliiz.com" : @company.setting[:facebookpage])
      like.set_attribute 'data-send', 'false'
      like.set_attribute 'class', "#{like.get_attribute('class')} fb-like"
      like.before "<script>(function(d, s, id) { var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) {return;}; js = d.createElement(s); js.id = id; js.src = '//connect.facebook.net/en_US/all.js#xfbml=1'; fjs.parentNode.insertBefore(js, fjs);}(document, 'script', 'facebook-jssdk'));</script>"
    end
  end

  def item_replace( tmp, item )
    tmp.to_s.gsub(/href=['|"]#cliiz['|"]/, "href='#{item[1]}'").to_s.gsub('#cliiz', item[2])
  end

end
