class MobileGenerator

  def page(page, company, components, security_tag)
    @scripts = [
      security_tag,
      '<link href="/stylesheets/modules_base.mobile.css" media="screen" rel="stylesheet" type="text/css">',
      "<script src='/modules/jquery.js' type='text/javascript'></script>",
      "<script src='/coreapi/modules/base.js' type='text/javascript'></script>"
    ]
    if page.nil?
      menu = company.setting[:menu].reject{ |i| !i[3] }
      content = intro(menu)
    else
      content = ''
      added_scripts = []
      components.each do |c|
        unless c.component.setting[:config].blank? || c.component.setting[:config][:js].blank? || added_scripts.include?(c.component.setting[:config][:js])
          @scripts <<  "<script src='/modules/#{c.component.setting[:config][:js]}' type='text/javascript'></script>"
          added_scripts << c.component.setting[:config][:js]
        end
        content += create_block c
      end
      @scripts <<  "<script src='http://maps.googleapis.com/maps/api/js?sensor=false' type='text/javascript'></script>" if added_scripts.include? 'location.js'
    end
    @scripts = @scripts.join("\n")
    layout company, content, @scripts
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

  def layout(company, content, scripts)
    ActionController::Base.new.send :render_to_string, '/layouts/mobile', :locals => { :setting => company.setting, :content => content, :scripts => scripts }
  end

  def intro(menu)
    ActionController::Base.new.send :render_to_string, '/layouts/mobile.intro', :locals => { :menu => menu }
  end

  def content_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/content/block.mobile', :locals => { :setting => setting(c), :uid => c.uid }
  end
      
  def infoform_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/infoform/block.mobile', :locals => { :setting => setting(c), :uid => c.uid }
  end
 
  def locationmark_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/locationmark/block.mobile', :locals => { :setting => setting(c), :uid => c.uid, :company => c.company }
  end

  def list_block(c)
    return ''
    ActionController::Base.new.send :render_to_string, '/modules/list/block', :locals => { :setting => setting(c), :uid => c.uid, :items => ModList.all(:conditions => { :used_component_id => c.id } , :order => 'created_at DESC') }
  end

  def item_block(c)
    return ''
    ActionController::Base.new.send :render_to_string, '/modules/list/item', :locals => { :item => c.extra_data }
  end

  def blog_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/blog/block.mobile', :locals => { :setting => setting(c), :uid => c.uid, :posts => ModBlog.all_of(c.id) }
  end

  def post_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/blog/post.mobile', :locals => { :post => c.extra_data }
  end

  def postfilter_block(c)
    ''
  end

  def gallery_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/gallery/block.mobile', :locals => { :setting => setting(c), :uid => c.uid, :items => c.extra_data }
  end

  def image_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/gallery/image.mobile', :locals => { :image => c.extra_data }
  end

  def youtube_block(c)
    return ''
    ActionController::Base.new.send :render_to_string, '/modules/3dparty/youtube', :locals => { :setting => setting(c), :uid => c.uid }
  end

  def setting(c)
    c.component.setting.deep_merge c.setting
  end
 
end
