class CreateFolders < ActiveRecord::Migration
  def self.up
    create_table :folders do |t|
      t.integer :company_id
      t.string :name
      t.integer :folder_id

      t.timestamps
    end
  end

  def self.down
    drop_table :folders
  end
end
