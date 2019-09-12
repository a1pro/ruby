class Universalpost < ActiveRecord::Migration
  def change
  create_table :universalpost do |t|

     t.string :tag, null: false
	 t.string :url, null: false
      t.text :file, null: false
      t.string :filetype, null: false
	   t.string :title, null: false
	   t.string :status, null: false
	   t.string :source, null: false
      t.timestamps
   end  
  end
end
