class Frame < ActiveRecord::Base

  has_attached_file :image, :styles => { :medium => "300x300#", :thumb => "120x120#" }

  after_create :fix_and_save_urls
  before_update :fix_urls

private

  def fix_and_save_urls
    fix_urls
    self.save
  end

  def fix_urls
    doc = Nokogiri::HTML(self.default)
    doc.css('head').css('[href]').each do |tag|
      tag.set_attribute 'href', "/templates/#{self.id}/#{tag['href']}" unless tag['href'].include? '/templates/'
    end
    doc.css('[src]').each do |tag|
      tag.set_attribute 'src', "/templates/#{self.id}/#{tag['src']}" unless tag['src'].include? '/templates/'
    end
    self.default = doc.to_s
  end

end
