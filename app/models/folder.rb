class Folder < ActiveRecord::Base
  
  attr_accessible :folder_id, :folder, :company_id, :company, :name
  validates_presence_of :name, :company_id

  belongs_to :folder
  belongs_to :company
  has_many :images, :dependent => :destroy
  has_many :folders, :dependent => :destroy

  def self.find_for_company( company, name)
    return nil if name.blank?
    folder = Folder.where( :company_id => company.id, :name => name ).first()
    folder = Folder.create( :company_id => company.id, :name => name ) if folder.blank?
    folder
  end

end
