class MobileGenerator

  def page(page, company, components, security_tag)
    if page.nil?
      menu = company.setting[:menu].reject{ |i| !i[3] }
      content = intro(menu)
    else
      content = ''
      components.each do |c|
        content += create_block c
      end
    end
    layout company, content
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

  def layout(company, content)
    ActionController::Base.new.send :render_to_string, '/layouts/mobile', :locals => { :setting => company.setting, :content => content }
  end

  def intro(menu)
    ActionController::Base.new.send :render_to_string, '/layouts/mobile.intro', :locals => { :menu => menu }
  end

  def content_block(c)
    ActionController::Base.new.send :render_to_string, '/modules/content/mobile', :locals => { :setting => setting(c), :uid => c.uid }
  end
      
  def infoform_block(c)
    return ''
    ActionController::Base.new.send :render_to_string, '/modules/infoform/block', :locals => { :setting => setting(c), :uid => c.uid }
  end
 
  def locationmark_block(c)
    return ''
    ActionController::Base.new.send :render_to_string, '/modules/locationmark/block', :locals => { :setting => setting(c), :uid => c.uid, :company => c.company }
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
    return ''
    ActionController::Base.new.send :render_to_string, '/modules/blog/block', :locals => { :setting => setting(c), :uid => c.uid, :posts => ModBlog.all_of(c.id) }
  end

  def post_block(c)
    return ''
    ActionController::Base.new.send :render_to_string, '/modules/blog/post', :locals => { :post => c.extra_data }
  end

  def postfilter_block(c)
    return ''
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
    return ''
    ActionController::Base.new.send :render_to_string, '/modules/gallery/block', :locals => { :setting => setting(c), :uid => c.uid, :items => c.extra_data }
  end

  def image_block(c)
    return ''
    ActionController::Base.new.send :render_to_string, '/modules/gallery/image', :locals => { :image => c.extra_data }
  end

  def youtube_block(c)
    return ''
    ActionController::Base.new.send :render_to_string, '/modules/3dparty/youtube', :locals => { :setting => setting(c), :uid => c.uid }
  end

  def setting(c)
    c.component.setting.deep_merge c.setting
  end
 
end
