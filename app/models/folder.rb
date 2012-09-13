class Folder < ActiveRecord::Base
  
  attr_accessible :folder_id, :folder, :company_id, :company, :name
  validates_presence_of :name, :company_id

  belongs_to :folder
  belongs_to :company
  has_many :images, :dependent => :destroy
  has_many :folders, :dependent => :destroy

end
