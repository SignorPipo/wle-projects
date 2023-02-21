/*
let visualParams = new PP.VisualRaycastParams();
visualParams.myRaycastResults = raycastResults;
PP.myVisualManager.draw(visualParams);

or

let visualRaycast = new PP.VisualRaycast(visualParams);
*/

PP.VisualRaycastParams = class VisualRaycastParams {

    constructor() {
        this._myRaycastResults = new PP.RaycastResults();

        this.myHitNormalLength = 0.2;
        this.myThickness = 0.005;

        this.myShowOnlyFirstHit = true;

        this.myRayMaterial = null;
        this.myHitNormalMaterial = null;

        this.myParent = PP.myVisualData.myRootObject;
        this.myIsLocal = false;

        this.myType = PP.VisualElementType.RAYCAST;
    }

    get myRaycastResults() {
        return this._myRaycastResults;
    }

    set myRaycastResults(result) {
        this._myRaycastResults.copy(result);
    }
};

PP.VisualRaycast = class VisualRaycast {

    constructor(params = new PP.VisualRaycastParams()) {
        this._myParams = params;

        this._myVisible = false;
        this._myAutoRefresh = true;

        this._myDirty = false;

        this._myVisualRaycast = new PP.VisualArrow();

        this._myVisualRaycast.setAutoRefresh(false);

        this._myVisualRaycastHitList = [];
        this._addVisualRaycastHit();

        this.forceRefresh();

        this.setVisible(true);
    }

    setVisible(visible) {
        if (this._myVisible != visible) {
            this._myVisible = visible;

            if (this._myVisible) {
                if (this._myParams.myRaycastResults.myRaycastSetup != null) {
                    this._myVisualRaycast.setVisible(true);
                }

                if (this._myParams.myRaycastResults.myHits.length > 0) {
                    let hitsToShow = Math.min(this._myParams.myRaycastResults.myHits.length, this._myVisualRaycastHitList.length);

                    for (let i = 0; i < hitsToShow; i++) {
                        let visualRaycastHit = this._myVisualRaycastHitList[i];
                        visualRaycastHit.setVisible(true);
                    }
                }
            } else {
                this._myVisualRaycast.setVisible(false);

                for (let visualRaycastHit of this._myVisualRaycastHitList) {
                    visualRaycastHit.setVisible(false);
                }
            }
        }
    }

    setAutoRefresh(autoRefresh) {
        this._myAutoRefresh = autoRefresh;
    }

    getParams() {
        return this._myParams;
    }

    setParams(params) {
        this._myParams = params;
        this._markDirty();
    }

    paramsUpdated() {
        this._markDirty();
    }

    refresh() {
        this.update(0);
    }

    forceRefresh() {
        this._refresh();

        this._myVisualRaycast.forceRefresh();

        if (this._myParams.myRaycastResults.myHits.length > 0) {
            let hitsToRefresh = Math.min(this._myParams.myRaycastResults.myHits.length, this._myVisualRaycastHitList.length);

            for (let i = 0; i < hitsToRefresh; i++) {
                let visualRaycastHit = this._myVisualRaycastHitList[i];
                visualRaycastHit.forceRefresh();
            }
        }
    }

    update(dt) {
        if (this._myDirty) {
            this._refresh();
            this._myDirty = false;
        }

        this._myVisualRaycast.update(dt);
        for (let visualRaycastHit of this._myVisualRaycastHitList) {
            visualRaycastHit.update(dt);
        }
    }

    _refresh() {
        for (let visualRaycastHit of this._myVisualRaycastHitList) {
            visualRaycastHit.setVisible(false);
        }

        if (this._myParams.myRaycastResults.myHits.length > 0) {
            let raycastDistance = this._myParams.myShowOnlyFirstHit ?
                this._myParams.myRaycastResults.myHits.pp_first().myDistance :
                this._myParams.myRaycastResults.myHits.pp_last().myDistance;

            {
                let visualRaycastParams = this._myVisualRaycast.getParams();
                visualRaycastParams.myStart.vec3_copy(this._myParams.myRaycastResults.myRaycastSetup.myOrigin);
                visualRaycastParams.myDirection.vec3_copy(this._myParams.myRaycastResults.myRaycastSetup.myDirection);
                visualRaycastParams.myLength = raycastDistance;
                visualRaycastParams.myThickness = this._myParams.myThickness;

                if (this._myParams.myRayMaterial == null) {
                    visualRaycastParams.myMaterial = PP.myVisualData.myDefaultMaterials.myDefaultRayMaterial;
                } else {
                    visualRaycastParams.myMaterial = this._myParams.myRayMaterial;
                }

                visualRaycastParams.myParent = this._myParams.myParent;
                visualRaycastParams.myIsLocal = this._myParams.myIsLocal;

                this._myVisualRaycast.paramsUpdated();

                this._myVisualRaycast.setVisible(this._myVisible);
            }

            let hitsToShow = this._myParams.myShowOnlyFirstHit ? 1 : this._myParams.myRaycastResults.myHits.length;
            while (hitsToShow > this._myVisualRaycastHitList.length) {
                this._addVisualRaycastHit();
            }

            for (let i = 0; i < hitsToShow; i++) {
                let visualRaycastHit = this._myVisualRaycastHitList[i];

                {
                    let visualRaycastHitParams = visualRaycastHit.getParams();
                    visualRaycastHitParams.myStart.vec3_copy(this._myParams.myRaycastResults.myHits[i].myPosition);
                    visualRaycastHitParams.myDirection.vec3_copy(this._myParams.myRaycastResults.myHits[i].myNormal);
                    visualRaycastHitParams.myLength = this._myParams.myHitNormalLength;
                    visualRaycastHitParams.myThickness = this._myParams.myThickness;

                    if (this._myParams.myHitNormalMaterial == null) {
                        visualRaycastHitParams.myMaterial = PP.myVisualData.myDefaultMaterials.myDefaultHitNormalMaterial;
                    } else {
                        visualRaycastHitParams.myMaterial = this._myParams.myHitNormalMaterial;
                    }

                    visualRaycastHitParams.myParent = this._myParams.myParent;
                    visualRaycastHitParams.myIsLocal = this._myParams.myIsLocal;

                    visualRaycastHit.paramsUpdated();

                    visualRaycastHit.setVisible(this._myVisible);
                }
            }

        } else if (this._myParams.myRaycastResults.myRaycastSetup != null) {
            {
                let visualRaycastParams = this._myVisualRaycast.getParams();
                visualRaycastParams.myStart.vec3_copy(this._myParams.myRaycastResults.myRaycastSetup.myOrigin);
                visualRaycastParams.myDirection.vec3_copy(this._myParams.myRaycastResults.myRaycastSetup.myDirection);
                visualRaycastParams.myLength = this._myParams.myRaycastResults.myRaycastSetup.myDistance;
                visualRaycastParams.myThickness = this._myParams.myThickness;

                if (this._myParams.myRayMaterial == null) {
                    visualRaycastParams.myMaterial = PP.myVisualData.myDefaultMaterials.myDefaultRayMaterial;
                } else {
                    visualRaycastParams.myMaterial = this._myParams.myRayMaterial;
                }

                visualRaycastParams.myParent = this._myParams.myParent;
                visualRaycastParams.myIsLocal = this._myParams.myIsLocal;

                this._myVisualRaycast.paramsUpdated();

                this._myVisualRaycast.setVisible(this._myVisible);
            }
        } else {
            this._myVisualRaycast.setVisible(false);
        }
    }

    _markDirty() {
        this._myDirty = true;

        if (this._myAutoRefresh) {
            this.update(0);
        }
    }

    clone() {
        let clonedParams = new PP.VisualRaycastParams();
        clonedParams.myRaycastResults = this._myParams.myRaycastResults;
        clonedParams.myHitNormalLength = this._myParams.myHitNormalLength;
        clonedParams.myThickness = this._myParams.myThickness;
        clonedParams.myShowOnlyFirstHit = this._myParams.myShowOnlyFirstHit;

        if (this._myParams.myRayMaterial != null) {
            clonedParams.myRayMaterial = this._myParams.myRayMaterial.clone();
        } else {
            clonedParams.myRayMaterial = null;
        }

        if (this._myParams.myHitNormalMaterial != null) {
            clonedParams.myHitNormalMaterial = this._myParams.myHitNormalMaterial.clone();
        } else {
            clonedParams.myHitNormalMaterial = null;
        }

        clonedParams.myParent = this._myParams.myParent;
        clonedParams.myIsLocal = this._myParams.myIsLocal;

        let clone = new PP.VisualRaycast(clonedParams);
        clone.setAutoRefresh(this._myAutoRefresh);
        clone.setVisible(this._myVisible);
        clone._myDirty = this._myDirty;

        return clone;
    }

    _addVisualRaycastHit() {
        let visualRaycastHit = new PP.VisualArrow();

        visualRaycastHit.setAutoRefresh(false);
        visualRaycastHit.setVisible(false);

        this._myVisualRaycastHitList.push(visualRaycastHit);
    }
};