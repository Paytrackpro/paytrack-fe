package storage

type UserStorage interface {
	CreateUser(user *User) error
	QueryUser(field, val string) (*User, error)
	ListUser() ([]User, error)
}

type User struct {
	Id           string
	UserName     string
	PasswordHash string
	Email        string
}

func (p *psql) CreateUser(user *User) error {
	return nil
}

func (p *psql) QueryUser(field, val string) (*User, error) {
	return nil, nil
}

func (p *psql) ListUser() ([]User, error) {
	return nil, nil
}
