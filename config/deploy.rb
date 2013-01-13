set :application, "Cliiz Website Builder"
set :deploy_to, "/home/arashvps/webuilder"
server "ps49055.dreamhost.com", :web, :app, :db, :primary => true
set :user, "arashvps"
set :use_sudo, false

# set :scm, :subversion
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

#role :web, ""                                              # Your HTTP server, Apache/etc
#role :app, "your app-server here"                          # This may be the same as your `Web` server
#role :db,  "your primary db-server here", :primary => true # This is where Rails migrations will run
#role :db,  "your slave db-server here"


default_run_options[:pty] = true  # Must be set for the password prompt from git to work
set :repository, "git@github.com:tectual/cliiz.git"  # Your clone URL
set :scm, "git"
#set :user, "arashvps"  # The server's user for deploys
#set :scm_passphrase, "xshape419"  # The deploy user's password
ssh_options[:forward_agent] = true
set :branch, "redesign"
set :deploy_via, :remote_cache


# if you want to clean up old releases on each deploy uncomment this:
# after "deploy:restart", "deploy:cleanup"

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

# If you are using Passenger mod_rails uncomment this:
require "bundler/capistrano"

namespace :deploy do
  task :start do ; end
  task :stop do 
    run "bundle exec rake RAILS_ENV=production RAILS_GROUPS=assets assets:precompile"
  end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "touch #{File.join(current_path,'tmp','restart.txt')}"
  end
end

before "deploy:symlink", "symlinks:create"
namespace :symlinks do
  task :create, :roles => :app do
    run "cd #{release_path}/public && rm templates -rf"
    run "cd #{release_path}/public && ln -s #{shared_path}/templates templates"
    run "cd #{release_path}/public && ln -s #{shared_path}/files files"
    #run "cd #{release_path}/public && ln -s #{shared_path}/assets assets"
  end
end

#before "deploy:symlink", "assets:precompile"
#namespace :assets do
#  desc "Compile assets"
#  task :precompile, :roles => :app do
#    run "cd #{release_path} && rake RAILS_ENV=#{rails_env} assets:precompile"
#  end
#end

