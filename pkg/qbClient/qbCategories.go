package qbClient

// Category represents a category with its name, save path, and associated endpoints.
type Category struct {
	Name       string   `json:"name"`
	SavePath   string   `json:"savePath"`
	ClientUrls []string `json:"locations"`
}
