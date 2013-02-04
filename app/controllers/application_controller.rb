class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :set_locale

  protected

    def firsttime_auto_login
      company = Company.find_by_name detect_domain
      sign_in company if !company.nil? && (company.sign_in_count==1)
    end

    def after_sign_in_path_for(resource)
      '/panel/edit'
    end

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

    def change_links_to_modify
      current_company.setting[:menu].collect!{ |i| i[1] = "/panel/edit#{i[1]}"; i }
    end

end
