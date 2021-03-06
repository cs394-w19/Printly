import React, { Component } from 'react';
import Trackbar from './Trackbar.js';
import '../App.css';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import JobDonePopup from './JobDonePopup.js';
import firebase from "firebase";
import CancelPopup from './CancelPopup.js';

const styles = theme => ({
	button:{
		color: '#04619f',
		background: '#FFFFFF',
	},
});

class JobInProgress extends Component {
	state = {
		jobStep: 2,
		showDonePopup: false,
		showCancelPopup: false,
	}

	componentDidMount() {
		let self = this;
		window.addEventListener('keydown', function(event) {
			switch(event.key) {
				case 'ArrowRight':
					let currStep = self.state.jobStep + 1;
					if (currStep > 4){
						self.setState({jobStep: currStep,
										showDonePopup: true})
					} else {
						self.setState({ jobStep: currStep });
					}
					break;
				default:
					return;
			}
		})

		let eta_string = this.getETAString();
		this.setState({ eta: eta_string });
	}

	closePopup = (rating, comment) => {
		let printer_path = "active_printers/" + String(this.props.printer_data["id"]);
		let printer_ref = firebase.database().ref(printer_path);

		let rating_total_ref = printer_ref.child('rating_total');
		rating_total_ref.once('value', function(snapshot) {
			let prev_rating_total = snapshot.val();
			rating_total_ref.set(prev_rating_total + rating);
		});

		let rating_count_ref = printer_ref.child('rating_count');
		rating_count_ref.once('value', function(snapshot) {
			let prev_rating_count = snapshot.val();
			rating_count_ref.set(prev_rating_count + 1);
		});

		printer_ref.once('value', function(snapshot) {
			let rating_total = snapshot.child("rating_total").val();
			let rating_count = snapshot.child("rating_count").val();
			let rating_ref = printer_ref.child('Rating');
			rating_ref.set(rating_total/rating_count);

			if (comment !== "")
			{
				let comment_ref = firebase.database().ref(printer_path + "/comments");
				comment_ref.push(comment);
			}
		});



		this.setState({ showDonePopup: false });
		this.props.changePage(this.props.PageEnum.HOME)
	}

	closeCancelPopup = (return_home) => {
		this.setState({ showCancelPopup: false });
		if (return_home)
		{
			this.props.changePage(this.props.PageEnum.HOME)
		}
	}

	getSettingsString = () => {
		var return_string = this.props.print_options["Sided"] + "-sided, ";
		return_string = return_string + this.props.print_options["Orientation"] + ", ";
		return_string = return_string + this.props.print_options["Color"] + ", ";
		var temp;
		if (this.props.print_options["copies"] === 1){
			temp = this.props.print_options["copies"];
			return_string = return_string + temp.toString() + " copy";
		} else {
			temp = this.props.print_options["copies"];
			return_string = return_string + temp.toString() + " copies";
		}
		
		return return_string;
	}

	getETAString = () => {
		var return_string = "";
		var number = 0;
		var first_time;
		var second_time;
		var isPM = false;
		if (this.props.print_options["Transfer"] === "Delivery"){
			number = Math.ceil((this.props.printer_data["Distance"] * 10)/5)*5;
		} else {
			number = 15;
		}

		var d = new Date();
		var h = d.getHours();
		var m = d.getMinutes();

		// --- Format first time
		m = m + number;
		while(m > 59){
			m = m - 60;
			h = h + 1;
		}

		while (h > 24){
			h = h - 24;
		}

		if (h > 12){
			h = h - 12;
		}

		if (h >= 12){
			isPM = true;
		}
		
		if (m < 10){
			first_time = h.toString() + ":0" + m.toString();
		} else {
			first_time = h.toString() + ":" + m.toString();
		}
		
		// --- Format second time
		m = m + 5;
		while (m > 59){
			m = m - 60;
			h = h + 1;
		}

		while (h > 24){
			h = h - 24;
		}

		if (h >= 12){
			isPM = true;
		}

		if (isPM){
			first_time = first_time + " PM";
		} else {
			first_time = first_time + " AM";
		}
		
		if (m < 10){
			second_time = h.toString() + ":0" + m.toString();
		} else {
			second_time = h.toString() + ":" + m.toString();
		}
		
		if (isPM){
			second_time = second_time + " PM";
		} else {
			second_time = second_time + " AM";
		}

		return return_string + first_time + " - " + second_time;
	}

	render() {
		const { classes } = this.props;

		let stars = [];
		for (let i = 0; i < Math.round(this.props.printer_data["Rating"]); i++)
		{
            stars.push(<span className="fa fa-star checked" key={i}></span>)
		}

		let temp_left = classes.button + " buttonleft";
			
		let imageRef = firebase.storage().ref().child('id_pictures/' + this.props.printer_data["name"] + ".png");
		imageRef.getDownloadURL().then((url) => {
			document.getElementById("progress" + this.props.printer_data["id"]).src = url;
		}).catch(function (error) {
			console.log(error);
		});

		let image = <img id={"progress" + this.props.printer_data["id"]} src='https://firebasestorage.googleapis.com/v0/b/printly.appspot.com/o/id_pictures%2Fprofile-icon-blue.png?alt=media&token=281ccc96-a3b3-4669-bb8b-7c1d17f07713' className="id_image" alt="logo" />
		return (
			<div>
				<div className="title">
					<div className="username">Hello {this.props.displayName}!</div>
					<img src='https://firebasestorage.googleapis.com/v0/b/printly.appspot.com/o/logo_new.png?alt=media&token=5b6207ee-4d0e-4a20-9e13-48933fe60432' className="logo" alt="logo"/>
				</div>
				{this.props.print_options['Transfer'] === 'Delivery' ? 
				<div className="trackbar_container">
					<Trackbar activeStep={this.state.jobStep} deliver/>
				</div> :
				<div className="trackbar_container">
					<Trackbar activeStep={this.state.jobStep}/>
				</div>}
				<div className="navigation">
					<Button style={{maxWidth: '160px', maxHeight: '50px', minWidth: '160px', minHeight: '50px'}} variant="outlined" 
							color="inherit" 
							className={temp_left} 
							onClick={() => this.setState({ showCancelPopup: true})}>
						Cancel
					</Button>

				</div>
				<div className="job_info_container">
					<div className="ETA">
						{(this.props.print_options["Transfer"] === "Delivery") ?
								<div className="ETA_title">ETA:</div>
							:
								<div className="ETA_title">Ready for pick-up:</div>
						}
						{this.state.eta}
					</div>
					<br/>
					<br/>
					<br/>
					<div className="job_step">
						{(this.state.jobStep === 2) ?
						<img src='https://firebasestorage.googleapis.com/v0/b/printly.appspot.com/o/Printly-connecting-v2.gif?alt=media&token=4fb88ddb-cc0c-4e1b-9435-871d26b76fb7' className="gif" alt="connecting_to_printer"/>
						:
						((this.state.jobStep === 3) ?
							<img src='https://firebasestorage.googleapis.com/v0/b/printly.appspot.com/o/Printly-printing_v2.gif?alt=media&token=bce15c8e-33b5-4068-9f54-533ed6d081c7' className="gif" alt="printing"/>
							:
							((this.props.print_options['Transfer'] === 'Pickup') ? 
								<img src='https://firebasestorage.googleapis.com/v0/b/printly.appspot.com/o/Printly-pickup-v2.gif?alt=media&token=9785febe-2324-4164-b882-874548f28ce0' className="gif" alt="pickup"/>
								:
								((this.state.jobStep === 4) ?
								<img src='https://firebasestorage.googleapis.com/v0/b/printly.appspot.com/o/Printly-delivery-v2.gif?alt=media&token=48dfdf85-e8b2-4544-bb96-70d3da868579' className="gif" alt="on_to_way"/>
								:
								null
								)
							)
						)
						}
					</div>
					<div style={{position: 'absolute', top: '65%', width: '100%'}}>
					<div className="job_info">
						<div className="job_id_image">
							{image}
						</div>
						<div className="job_info_text">
						<div style={{display: 'inline-flex'}}>
							<div className="word big" style={{display: 'flex', color: 'black', fontWeight: 'bold'}}>
								{this.props.printer_data["name"]} 
							</div>
							<div className="word big" style={{display: 'flex'}}>
								|
							</div>
							{(this.props.print_options.Transfer === 'Delivery') ?
								<div className="word big" style={{display: 'flex'}}>{this.props.address}</div>
								:
								<div className="word big" style={{display: 'flex'}}>{this.props.printer_data["address"]}</div>
							}
						</div>
						<br/>
						<span className="word small" style={{fontWeight: 'bold', color: 'black'}}>
						Rating: {stars}
						</span>
						<br/>
						<span className="word small" style={{fontWeight: 'bold', color: 'black'}}>Settings:</span> {this.getSettingsString()}
						</div>
					</div>
					</div>
				</div>
	        	<br/>

				{this.state.showDonePopup ? 
					<JobDonePopup
						closePopup={this.closePopup}
						print_options={this.props.print_options}
						printer_data={this.props.printer_data}
						price={this.props.price}
						pricesPerPage={this.props.pricesPerPage}
						discount_rate={this.props.discount_rate}/>
					: null
				}

				{this.state.showCancelPopup ? 
					<CancelPopup
					closeCancelPopup={this.closeCancelPopup}/>
					: null
				}

				
			</div>
		);
	}
}

JobInProgress.propTypes = {
	classes: PropTypes.object.isRequired
  };

export default withStyles(styles)(JobInProgress);


