import swal from 'sweetalert';
import utils from './Util/Util';
let common = {
    responseHandler(data, error, isFetching) {
        let toReturn = false;
        if (error) {
            if (error != "Request canceled") {
                swal({ title: "Error", text: error, icon: "error" });
            }
            return toReturn;
        }
        if (!isFetching && data) {
            if (data.success) {
                toReturn = true;
            } else {
                if (data.message === utils.SessionExpired && !window.location.hash.includes("login")) {
                    swal({ title: "Error", text: data.message, icon: "error" })
                    window.location.replace("/")

                }
            }
        }
        return toReturn;
    }
}


export default common;
