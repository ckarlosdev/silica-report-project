import { Button } from 'react-bootstrap'

type Props = {}

function LogoutButton({}: Props) {

    const handleLogout = () => {
        console.log("Logging out...")
    }


  return (
    <Button
      onClick={handleLogout}
    //   disabled={isLoading}
      variant="outline-danger"
      style={{
        borderRadius: "10px",
        fontWeight: "bold",
        width: "120px",
        height: "40px",
      }}
      className="no-print"
    >
      {/* {isLoading ? <span>Logging out</span> : <>Logout</>} */}
      Logout
    </Button>
  )
}

export default LogoutButton