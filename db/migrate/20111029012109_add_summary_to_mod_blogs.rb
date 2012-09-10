class AddSummaryToModBlogs < ActiveRecord::Migration
  def self.up
    add_column :mod_blogs, :summary, :text
  end

  def self.down
    remove_column :mod_blogs, :summary
  end
end
