class CreateImages < ActiveRecord::Migration
  def self.up
    create_table :images do |t|
      t.integer :company_id
      t.string :entity_file_name
      t.string :entity_content_type
      t.integer :entity_file_size
      t.datetime :entity_updated_at

      t.timestamps
    end
  end

  def self.down
    drop_table :images
  end
end
