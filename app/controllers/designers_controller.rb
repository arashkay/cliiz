class DesignersController < ApplicationController
  
  # before_filter :authenticate_designer!
  
  def index
    
  end

  def upload
    require 'zip/zip'
    @correctStructure = 0
    unless params[:zipfile].blank?
      location = "public/designers/tmp/#{DateTime.now.to_i}"
      Dir::mkdir(location) unless FileTest::directory? location
      path = File.join(location, params[:zipfile].original_filename)
      File.open(path, "wb") { |f| f.write(params['zipfile'].read) }
      log = ''
      Zip::ZipFile.foreach(path) do |a|
        log = "#{log}\n#{a.name}" 
        @correctStructure += 1 if ['template/images/','template/stylesheets/'].include? a.name.to_s 
      end
      File.open(File.join(location,'info.txt'), "wb") { |f| f.write("is valid? #{@correctStructure==2}\n#{path.to_s}\nname: #{params[:name]}\nteam: #{params[:team]}\nemail: #{params[:email]}\n #{log}") }
    end
  end

end
