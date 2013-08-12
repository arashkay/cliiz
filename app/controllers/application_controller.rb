class ApplicationController < ActionController::Base
  protect_from_forgery
  #golshan's edit
  before_filter :set_locale

  protected

    def set_locale
      I18n.locale = cookies[:locale] || :en
      cookies[:locale] = I18n.locale
    end

    def is_admin
      authenticate_company! if current_company.blank? 
      redirect_to '/panel' if('1@gmail.com'!=current_company.email)
    end

    def refresh_site!
      domain = detect_domain
      FileUtils.rm_rf "#{Rails.root}/cache/#{domain}/"
    end
    
    def detect_domain
      self.request.host.gsub('www.', '').split('.')[0]
    end

end
