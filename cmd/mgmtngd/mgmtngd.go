package main

import (
	"code.cryptopower.dev/private/mgmt-ng/storage"
	"code.cryptopower.dev/private/mgmt-ng/webserver"
	"log"
)

func main() {
	err := _main()
	log.Println(err)
}

func _main() error {
	conf, err := loadConfig()
	if err != nil {
		return err
	}
	db, err := storage.NewStorage(conf.dbConfig())
	web, err := webserver.NewWebServer(conf.webConfig(), db)
	return web.Run()
}
