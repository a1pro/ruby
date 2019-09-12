class CreateVictoryPosts < ActiveRecord::Migration
  def change
    create_table :victory_posts do |t|
    t.integer :userid, null: false
	t.string :title, null: false
	t.text :description, null: false
	t.text :image, null: false
	t.string :victory_type, null: false
      t.timestamps null: false 
    end
  end
end
