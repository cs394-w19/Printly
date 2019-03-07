import React from 'react';
import firebase from "firebase";
import StyleFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';


export default class SignIn extends React.Component {
	constructor() {
		super();
		this.state = {
			userID: null,
		};

	}
	uiConfig = {
		signInFlow: "popup",
		signInOptions: [
			firebase.auth.GoogleAuthProvider.PROVIDER_ID
		],
		callbacks: {
			signInSuccessWithAuthResults: () => false
		}
	};
	componentDidMount = () => {
		firebase.auth().onAuthStateChanged(user => {
			this.setState({
				userID : user ? user.uid : ""
			})
		});
	}

	render() {
		return (
			<div>
				<div className="title"></div>
				<div className="homeInfo">
					<div className="home_top_container">
						<img src='https://firebasestorage.googleapis.com/v0/b/printly.appspot.com/o/Printly%20Home%20-%20top.png?alt=media&token=1981989b-0e64-45e1-94fb-9a5d5e21a3d5' alt="home_info" className="home_top_image"/>
					</div>
					<div className="home_upload_container">
						<StyleFirebaseAuth
							uiConfig={this.uiConfig}
							firebaseAuth={firebase.auth()}
						/>
					</div>
					<div className="home_bottom_container">
						<img src='https://firebasestorage.googleapis.com/v0/b/printly.appspot.com/o/Printly%20Home%20-%20bottom.png?alt=media&token=f9f814cf-dfb5-4e71-88bc-b43799a9b943' alt="home_info" className="home_bottom_image"/>
					</div>
				</div>
           </div>
	);}
} 
