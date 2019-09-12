class CreateFeaturedVideos < ActiveRecord::Migration
  def change
    create_table :featured_videos do |t|
		t.string :key, null: false
	t.string :title, null: false
	t.text :value, null: false
      t.timestamps null: false
    end
  end
end
