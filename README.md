worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
  
    keepalive_timeout  65;

    #gzip  on;

	map $http_upgrade $connection_upgrade {
    	default upgrade;
    	'' close;
	}

    server {
        listen       80;
        #server_name  localhost;
		client_max_body_size 20m;
	
		proxy_http_version 1.1;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "Upgrade";
		proxy_set_header X-Requested-With $http_x_requested_with;
    		
    	location ^~ /file/ {
            proxy_pass  http://120.77.236.104:82$uri;
        }
    		
    	location ~ /.+\..+ {
    		proxy_pass  http://127.0.0.1:8000;
    	}
    		
    	location / {
    		proxy_pass  $proxy_to;
    	}
    }
}
