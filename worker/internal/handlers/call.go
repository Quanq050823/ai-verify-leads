package handlers

import (
	// "bytes"

	"encoding/json"
	"time"
	// "fmt"
	// "net/http"
)

// CallAPIRequest represents the API request structure for making a call
type CallAPIRequest struct {
	LeadID string `json:"leadID"`
	Phone  string `json:"phone"`
}

// HandleCall processes a lead for a call action
func HandleCall(questions *json.RawMessage) error {
	println("Handling call for lead: %s", string(*questions))

	// Sleep for 5 seconds
	time.Sleep(10 * time.Second)

	// // Define the URL
	// url := "https://callflow143.primas.net:1501/system/CallFlow/outreach/195"

	// // Create the request
	// req, err := http.NewRequest("POST", url, bytes.NewBuffer(*questions))
	// if err != nil {
	// 	fmt.Println("Error creating request:", err)
	// 	return err
	// }

	// // Set headers
	// req.Header.Set("Content-Type", "application/json")
	// req.Header.Set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI5MTZjNjgzMi00YjZjLTQ5ZDAtOTA3OC1mMzIxOGUwNjgyNDgiLCJuYW1lIjoiYWRtaW5AcHJpbWFzLm5ldCIsInJvbGUiOiI5OTktU3VwZXJBZG1pbiIsImxhc3Rsb2dpbiI6IjUvMjYvMjAyMyAxMDoxMDo0OSBBTSIsInBpY3R1cmUiOiIiLCJuYmYiOjE2ODUwNzA2NTUsImV4cCI6MjAwMDY4OTg0OSwiaWF0IjoxNjg1MDcwNjU1fQ.dnGhU1U72CI2k_BOS2IU1j1Bk5D8YSfv1ZD505_vUEc")

	// // Make the request
	// client := &http.Client{}
	// resp, err := client.Do(req)
	// if err != nil {
	// 	fmt.Println("Error making request:", err)
	// 	return err
	// }
	// defer resp.Body.Close()

	// // Print response status
	// fmt.Println("Response Status:", resp.Status)

	return nil
}
