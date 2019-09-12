class CreateFeatureds < ActiveRecord::Migration
  def change
    create_table :featureds do |t|
			t.string :key, null: false
	t.string :title, null: false
	t.text :value, null: false
      t.timestamps null: false
    end
  end
end
