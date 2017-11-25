worker_processes  1;
events {
    worker_connections  1024;
}
http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    map $http_upgrade $connection_upgrade {
      	default upgrade;
      	'' close;
  	}

    server {
        listen       80;
				client_max_body_size 20m;

				set $proxy_to http://120.77.236.104:82;
        set $web_dev http://127.0.0.1:8000;

        proxy_http_version 1.1;
    		proxy_set_header Upgrade $http_upgrade;
    		proxy_set_header Connection "Upgrade";
    		proxy_set_header X-Requested-With $http_x_requested_with;

    		location ^~ /file/ {
                proxy_pass  $proxy_to$uri;
        }

    		location ~ /.+\..+ {
    				proxy_pass  $web_dev;
    		}

    		location / {
    				proxy_pass  $proxy_to;
    		}
    }
}
